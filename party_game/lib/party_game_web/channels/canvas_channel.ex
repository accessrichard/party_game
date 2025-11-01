defmodule PartyGameWeb.CanvasChannel do
  require Logger
  use PartyGameWeb, :channel

  alias PartyGame.Server
  alias PartyGame.Lobby
  alias PartyGame.Games.Canvas.CanvasGame

  import PartyGameWeb.GameUtils

  @channel_name "canvas:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        name = Map.get(payload, "name")
        socket = assign(socket, :name, name)
        send(self(), {:after_join, payload})
        {:ok, socket}

      _ ->
        send(self(), {:after_join, :game_not_found})
        {:ok, socket}
    end
  end

  @impl true
  def handle_info({:after_join, :game_not_found}, socket) do
     broadcast("lobby:#{game_code(socket.topic)}",  "handle_game_server_idle_timeout", %{"reason" => "Game Not Found"})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, payload}, socket) do
    size = Map.get(payload, "size", [])
    name = Map.get(payload, "name", "")

    Server.get_game(game_code(socket.topic))
    |> CanvasGame.add_size(name, size)
    |> Lobby.update_player_location(name, "canvas")
    |> Server.update_game()

    {:noreply, socket}
  end

  @impl true
  def handle_in("commands", payload, socket) do
    broadcast_from(socket, "commands", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("size", payload, socket) do
    broadcast_from(socket, "handle_size", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("end_game", payload, socket) do
    game = Server.get_game(game_code(socket.topic))
     |> Lobby.update_player_location(socket.assigns.name, "lobby")
     |> Server.update_game()

    player_names = Lobby.players(game, "canvas")
    count_active = Enum.count(player_names)
    advance_turn = Map.get(payload, "advance_turn", false)

    cond do
      game.room_owner == socket.assigns.name ->
        broadcast_from(socket, "handle_quit", %{})
        {:noreply, socket}
      count_active < 1 ->
        broadcast_from(socket, "handle_quit", %{})
        {:noreply, socket}
      true ->
        handle_in(if(advance_turn, do: "next_turn", else: "switch_editable"), %{}, socket)
    end
  end

  @impl true
  def handle_in("word", _, socket) do
    game_room = Server.get_game(game_code(socket.topic))
    broadcast(socket, "word", %{"word" => CanvasGame.word(1, game_room.game.settings.difficulty) |> Enum.at(0)})
    {:noreply, socket}
  end

  @impl true
  def handle_in("guess", payload, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.guess(Map.get(payload, "guess"), socket.assigns.name)
      |> Server.update_game()

    resp = Map.put(payload, "winner", game_room.game.winner)
    broadcast(socket, "handle_guess", resp)
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_game", payload, socket) do
    Logger.debug("New Canvas Game #{socket.topic}")
    type = Map.get(payload, "type", "canvas")
    name = Map.get(payload, "name", "canvas_game")
    words = Map.get(payload, "words", [])
    settings = Map.get(payload, "settings", %{})

    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.set_game(CanvasGame.new(%{name: name, type: type, words: words, settings: settings}))
      |> CanvasGame.change_word()
      |> CanvasGame.change_turn()
      |> CanvasGame.start_round()
      |> Server.update_game()

    {:ok, time} = PartyGame.PartyGameTimer.start_timer(socket.topic, 4000, %{module: "CanvasChannel", function: "next_round", args: %{}})
    IO.inspect time, label: "------------"
    broadcast(socket, "handle_new_game", %{
      "turn" => game_room.game.turn,
      "word" => game_room.game.word,
      "size" => CanvasGame.min_size(game_room),
      "players" => Lobby.players(game_room, "canvas")
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("next_turn", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.change_word()
      |> CanvasGame.change_turn()
      |> Server.update_game()

    broadcast(socket, "handle_new_game", %{
      "turn" => game_room.game.turn,
      "word" => game_room.game.word,
      "players" => Lobby.players(game_room, "canvas"),
      "isOver" => game_room.game.is_over
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("switch_editable", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.change_turn()
      |> Server.update_game()

    broadcast(socket, "handle_new_game", %{
      "turn" => game_room.game.turn,
      "word" => game_room.game.word,
      "players" => Lobby.players(game_room, "canvas")
    })

    {:noreply, socket}
  end

end
