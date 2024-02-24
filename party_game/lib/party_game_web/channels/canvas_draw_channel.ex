defmodule PartyGameWeb.CanvasDrawChannel do
  require Logger
  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.Server
  alias PartyGame.Game.Player
  alias PartyGame.ChannelWatcher
  alias PartyGame.Lobby
  alias PartyGame.Games.Canvas.CanvasGame

  @channel_name "canvas:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        name = Map.get(payload, "name")
        socket = assign(socket, :name, name)
        send(self(), {:after_join})
        {:ok, socket}

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

    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: DateTime.utc_now() |> DateTime.to_unix(:second),
        typing: false
      })

    push(socket, "presence_state", Presence.list(socket))
    player = Player.add_player(socket.assigns.name)

    broadcast_from(socket, "handle_join", player)
    {:noreply, socket}
  end

  @impl true
  def handle_in("commands", payload, socket) do
    broadcast_from(socket, "commands", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("resize", payload, socket) do
    broadcast_from(socket, "resize", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("word", _, socket) do
    broadcast(socket, "word", %{"word" => CanvasGame.word(1) |> Enum.at(0)})
    {:noreply, socket}
  end

  @impl true
  def handle_in("start", _, socket) do
    broadcast(socket, "start", %{"word" => CanvasGame.word(1) |> Enum.at(0)})
    {:noreply, socket}
  end

  def leave(topic, name) do
    players = Map.keys(Presence.list("lobby:" <> game_code(topic)))

    if players == [] do
      Server.stop(game_code(topic))
    else
      player_leave(Server.lookup(game_code(topic)), name, players, topic)
    end
  end

  defp player_leave({:error, _}, _, _, _), do: :ok

  defp player_leave({:ok, _}, name, players, topic) do
    game_room = Server.get_game(game_code(topic))
    game_room = Lobby.remove_player(game_room, name)

    game_room =
      if name == game_room.room_owner do
        elect_new_game_owner(players, topic, game_room)
      else
        game_room
      end

    Server.update_game(game_room)
  end

  defp elect_new_game_owner(players, topic, game_room) do
    new_owner = List.first(players)
    game_room = Lobby.update_room_owner(game_room, new_owner)
    PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{room_owner: new_owner})
    game_room
  end

  defp game_code(topic) do
    [_ | code] = String.split(topic, ":")
    [code] = code
    code
  end
end
