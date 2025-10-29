defmodule PartyGameWeb.LobbyChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.{Server, Lobby}
  alias PartyGame.ChannelWatcher
  alias PartyGame.Game.Player
  import PartyGameWeb.GameUtils

  @channel_name "lobby:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        name = Map.get(payload, "name")
        socket = assign(socket, :game, Server.get_game(room_name))
        socket = assign(socket, :name, name)
        send(self(), {:after_join})
        {:ok, %{owner: socket.assigns.game.room_owner}, socket}

      _ ->
        send(self(), {:after_join, :game_not_found})
        {:ok, socket}
    end
  end

  @impl true
  def handle_info({:after_join, :game_not_found}, socket) do
    broadcast(socket, "handle_game_server_idle_timeout", %{"reason" => "Game Not Found"})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    :ok =
      ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})

    location = if socket.assigns.game == nil, do: "lobby", else: "game"

    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: DateTime.utc_now() |> DateTime.to_unix(:second),
        typing: false,
        location: location
      })

    push(socket, "presence_state", Presence.list(socket))
    player = Player.add_player(socket.assigns.name)
    broadcast_from(socket, "handle_join", player)
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
  def handle_in("new_game", payload, socket) do
    player_count = length(Map.keys(Presence.list(socket.topic)))

    broadcast(socket, "route_to_game", %{
      "type" => Map.get(payload, "type"),
      "player_count" => player_count
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("handle_disconnect", _, socket) do
    Logger.debug("disconnect handled on #{socket.topic} for: #{socket.assigns.name}")

    push(socket, "handle_disconnect", Server.get_game(game_code(socket.topic)))
    {:noreply, socket}
  end

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

  defp remove_player({:error, _}, _), do: :ok

  defp remove_player({:ok, _}, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.remove_player(socket.assigns.name)

    Server.update_game(game_room)

    :ok
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
end
