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
        name = Map.get(payload, "name")
        socket = assign(socket, :game, Server.get_game(room_name))
        socket = assign(socket, :name, name)
        send(self(), {:after_join})
        {:ok, socket}

      _ ->
        send(self(), {:after_join, :game_not_found})
        {:ok, socket}
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
    metas =
      Presence.get_by_key(socket.topic, socket.assigns.name)[:metas]
      |> List.first()
      |> Map.merge(%{location: Map.get(payload, "location")})

    {:ok, _} = Presence.update(socket, socket.assigns.name, metas)

    {:noreply, socket}
  end

  @impl true
  def handle_in("user:typing", payload, socket) do
    metas =
      Presence.get_by_key(socket.topic, socket.assigns.name)[:metas]
      |> List.first()
      |> Map.merge(%{typing: Map.get(payload, "typing")})

    {:ok, _} = Presence.update(socket, socket.assigns.name, metas)

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

    Logger.debug("visibilty_change: #{visible?} on #{socket.topic} for: #{socket.assigns.name}")

    multiplayer? = unless visible?, do: multiplayer?(socket.topic), else: false

    visibility_change(%{
      visible?: visible?,
      multiplayer?: multiplayer?,
      payload: payload,
      socket: socket
    })

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

  defp visibility_change(%{visible?: true, payload: _, socket: socket}) do
    topic = "#{@visibility_timer_name}:#{game_code(socket.topic)}"
    Logger.debug("Cancel Timer #{topic}")
    PartyGameTimer.cancel_timer(topic)
  end

  defp visibility_change(%{
         visible?: false,
         multiplayer?: true,
         payload: _payload,
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
    Enum.at(Map.keys(Presence.list(topic)), 1) != nil
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
    players = Map.keys(Presence.list(topic))

    if players == [] do
      # Since the ChannelWatcher may trigger off network disconnects
      # leave the server for now...
      #
      # Server.stop(game_code(topic))
    else
      player_leave(Server.lookup(game_code(topic)), name, players, topic)
    end
  end

  defp player_leave({:error, _}, _, _, _), do: :ok

  defp player_leave({:ok, _}, name, players, topic) do
    Logger.debug("player_leave #{topic} name: #{name}")
    game_room = Server.get_game(game_code(topic))

    # The ChannelWatcher may be called after :after_join is re-called which adds the
    # player back into the lobby causing sequencing errors.
    #
    # game_room = Lobby.remove_player(game_room, name)

    game_room =
      if name == game_room.room_owner and players !== [] do
        elect_new_game_owner(players, topic, game_room)
      else
        game_room
      end

    Server.update_game(game_room)
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

    # player = Enum.find(game.players, &(&1.name == name))

    # unless player == nil and PartyGame.Game.Player.inactive?(player, inactive_time) and
    #         Enum.at(game.players, 1) == nil do
    new_owner = get_new_owner(game.players, name)
    Logger.debug("Electing new game owner on #{topic} from #{name} to #{new_owner.name}")
    game = Lobby.update_room_owner(game, new_owner.name)
    Server.update_game(game)

    PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{
      room_owner: game.room_owner
    })
  end

  defp get_new_owner(players, name) when players == [] do
    %PartyGame.Game.Player{name: name}
  end

  defp get_new_owner(players, name) do
    [player | p] = players

    if player.name == name do
      get_new_owner(p, name)
    else
      player
    end
  end
end
