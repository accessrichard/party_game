defmodule PartyGameWeb.LobbyChannel do
  require Logger

  use PartyGameWeb, :channel
  use PartyGameWeb.GameChannel

  alias PartyGame.PartyGameTimer
  alias PartyGameWeb.Presence
  alias PartyGame.{Server, Lobby}
  alias PartyGame.ChannelWatcher
  alias PartyGame.Game.Player

  @channel_name "lobby:"

  @visibility_timer_name "visibility:"

  def channel_name, do: @channel_name

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.debug("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        socket =
          socket
          |> assign(:name, Map.get(payload, "name"))
          |> assign(:game, Server.get_game(room_name))

        send(self(), {:after_join})
        {:ok, socket}

      _ ->
        {:error, %{reason: "game_not_found"}}
    end
  end

  @impl true
  def handle_info({:after_join}, socket) do
    Logger.debug("After Join #{socket.topic} for: #{socket.assigns.name}")

    :ok =
      ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})
    Logger.debug("After Join ChannelWatcher #{socket.topic} for: #{socket.assigns.name}")
    location = if socket.assigns.game == nil, do: "lobby", else: "game"
    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: DateTime.utc_now() |> DateTime.to_unix(:second),
        typing: false,
        location: location
      })

    push(socket, "presence_state", Presence.list(socket))
    player = Player.add_player(socket.assigns.name)

    config = Application.get_env(:party_game, PartyGameWeb.LobbyChannel)

    Logger.debug("After Join push socket #{socket.topic} for: #{socket.assigns.name}")

    broadcast_from(socket, "handle_join", %{
      player: player,
      settings: %{newGamePromtTime: config[:new_game_prompt_time]}
    })

    Logger.debug("After Join broadcast_from #{socket.topic} for: #{socket.assigns.name}")

    {:noreply, socket}
  end

  @impl true
  def handle_in("presence_location", payload, socket) do
    case Presence.get_by_key(socket.topic, socket.assigns.name) do
      %{metas: [meta | _]} ->
        new_meta = Map.merge(meta, %{location: Map.get(payload, "location")})
        Presence.update(socket, socket.assigns.name, new_meta)

      _ ->
        :ok
    end
    {:noreply, socket}
  end

  @impl true
  def handle_in("user:typing", payload, socket) do
    case Presence.get_by_key(socket.topic, socket.assigns.name) do
      %{metas: [meta | _]} ->
        new_meta = Map.merge(meta, %{typing: Map.get(payload, "typing")})
        Presence.update(socket, socket.assigns.name, new_meta)
      _ ->
        :ok
    end

    {:noreply, socket}
  end

  @impl true
  def handle_in("route_to_game", payload, socket) do
    player_count = length(Map.keys(Presence.list(socket.topic)))
    broadcast(socket, "route_to_game", %{
      "selectedGame" => Map.get(payload, "selectedGame"),
      "player_count" => player_count
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("visiblity_change", payload, socket) do
    visible? = Map.get(payload, "isVisible")

    Logger.debug("visibility_change: #{visible?} on #{socket.topic} for: #{socket.assigns.name}")

    visibility_change(%{
      visible?: visible?,
      multiplayer?: !visible? && multiplayer?(socket.topic),
      socket: socket
    })

    {:noreply, socket}
  end

   @impl true
  def handle_in(@channel_name <> _room_name, payload, socket) do
    broadcast(socket, "chat", payload)
    {:noreply, socket}
  end

  # Called after ChannelWatcher leave triggers to set the new game owner.
  #
  # 1. The client socket is disconnected
  # 2. The ChannelWatcher triggers the leave call
  # 3. The Client socket reconnects
  # 4. The Client calls handle_reconnect to sycn the game back up.
  @impl true
  def handle_in("handle_reconnect", _, socket) do
    Logger.debug("reconnect handled on #{socket.topic} for: #{socket.assigns.name}")

    game = Server.get_game(game_code(socket.topic))

    push(socket, "handle_reconnect", %{
      room_owner: game.room_owner
    })

    {:noreply, socket}
  end

  # The multipe choice game will ping the server periodically
  # to keep the GenServer alive in case it has a configured
  # smaller timeout.
  @impl true
  def handle_in("ping", _, socket) do
    Server.ping(game_code(socket.topic))
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    Logger.debug("terminating on #{socket.topic} for: #{socket.assigns.name}")
    remove_player(Server.lookup(game_code(socket.topic)), socket)
  end

  defp visibility_change(%{multiplayer?: false}), do: :ok

  defp visibility_change(%{visible?: true, socket: socket}) do
    topic = "#{@visibility_timer_name}:#{game_code(socket.topic)}"
    Logger.debug("Cancel Timer #{topic}")
    PartyGameTimer.cancel_timer(topic)
  end

  defp visibility_change(%{
         visible?: false,
         multiplayer?: true,
         socket: socket
       }) do
    config = Application.get_env(:party_game, PartyGameWeb.LobbyChannel)
    inactive_time_check = config[:player_inactive_time_check]
    Logger.debug("START Timer #{"#{@visibility_timer_name}:#{game_code(socket.topic)}"}")

    PartyGameTimer.start_timer(
      "#{@visibility_timer_name}:#{game_code(socket.topic)}",
      inactive_time_check * 1000,
      %{
        module: __MODULE__,
        function: :timeout_elect_new_game_owner,
        args: [socket.topic, socket.assigns.name]
      }
    )
  end

  defp multiplayer?(topic) do
    map_size(Presence.list(topic)) > 1
  end

  defp remove_player({:error, _}, _), do: :ok

  defp remove_player({:ok, _}, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.remove_player(socket.assigns.name)

    Server.update_game(game_room)
  end

  def leave(socket) do
    leave(socket.topic, socket.assigns.name)
  end

  def leave(topic, name) do
    Logger.debug("ChannelWatcher Leave called: #{topic} name: #{name}")

    case Server.lookup(game_code(topic)) do
      {:ok, _pid} ->
        game_room = Server.get_game(game_code(topic))
        remaining_players = Map.keys(Presence.list(topic))

        new_game_room =
          if game_room.room_owner == name and remaining_players != [] do
            elect_new_game_owner(remaining_players, topic, game_room)
          else
            game_room
          end

        Server.update_game(new_game_room)

      {:error, _} ->
        :ok
    end
  end

  defp elect_new_game_owner(players, topic, game_room) do
    new_owner = List.first(players)
    Logger.debug("Electing game owner on #{topic} to: #{new_owner}")

    game_room = Lobby.update_room_owner(game_room, new_owner)
    PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{room_owner: new_owner})
    game_room
  end

  def timeout_elect_new_game_owner(topic, name) do
    multiplayer? = multiplayer?(topic)
    timeout_elect_new_game_owner(%{multiplayer?: multiplayer?}, topic, name)
  end

  defp timeout_elect_new_game_owner(%{multiplayer?: false}, _, _), do: :ok

  defp timeout_elect_new_game_owner(%{multiplayer?: true}, topic, name) do
    game_code = game_code(topic)
    game = Server.get_game(game_code)

    case get_new_owner(game.players, name) do
      nil ->
        :ok

      %Player{name: new_owner_name} ->
        Logger.debug("Electing new game owner on #{topic} from #{name} to #{new_owner_name}")
        game = Lobby.update_room_owner(game, new_owner_name)
        Server.update_game(game)

        PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{
          room_owner: game.room_owner
        })
    end
  end

  defp get_new_owner(players, name_to_skip) do
    Enum.find(players, &(&1.name != name_to_skip))
  end
end
