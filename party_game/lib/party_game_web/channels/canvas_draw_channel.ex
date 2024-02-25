defmodule PartyGameWeb.CanvasDrawChannel do
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

  @impl true
  def handle_in("guess", payload, socket) do
    Server.get_game(game_code(socket.topic))
      |> CanvasGame.add_guess(Map.get(payload, "guess"))
      |> Server.update_game()

    broadcast(socket, "handle_guess", payload)
    {:noreply, socket}
  end

  def handle_in("new_game", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.set_game(CanvasGame.new(%{name: "free_draw"}))
      |> CanvasGame.change_word()
      |> CanvasGame.change_turn()
      |> CanvasGame.start_round()
      |> Server.update_game()

    broadcast(socket, "handle_new_game", %{"turn" => game_room.game.turn, "word" => game_room.game.word})

    {:noreply, socket}
  end

  def handle_in("next_turn", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.change_word()
      |> CanvasGame.change_turn()
      |> Server.update_game()

    broadcast(socket, "handle_new_game", %{"turn" => game_room.game.turn, "word" => game_room.game.word})

    {:noreply, socket}
  end
end
