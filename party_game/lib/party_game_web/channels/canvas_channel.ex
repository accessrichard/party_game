defmodule PartyGameWeb.CanvasChannel do
  require Logger
  use PartyGameWeb, :channel

  alias PartyGame.Server
  alias PartyGame.Lobby
  alias PartyGame.Games.Canvas.CanvasGame
  alias PartyGame.Game.GameRoom
  alias PartyGameWeb.Presence
  alias PartyGame.ChannelWatcher

  import PartyGameWeb.GameUtils

  @channel_name "canvas:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.debug("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

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
    lobby = PartyGameWeb.LobbyChannel.channel_name()

    broadcast("#{lobby}#{game_code(socket.topic)}", "handle_game_server_idle_timeout", %{
      "reason" => "Game Not Found"
    })

    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, payload}, socket) do
    :ok =
      ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})

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
    Server.get_game(game_code(socket.topic))
    |> CanvasGame.touch_expires()
    |> Server.update_game()

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
    game =
      Server.get_game(game_code(socket.topic))
      |> Lobby.update_player_location(socket.assigns.name, "lobby")
      |> Server.update_game()

    player_names = Lobby.players(game, "canvas")
    count_active = Enum.count(player_names)
    advance_turn = Map.get(payload, "advance_turn", false)

    cancel_timer(game)

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
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.touch_expires()
      |> Server.update_game()

    broadcast(socket, "word", %{
      "word" => CanvasGame.word(1, game_room.game.settings.difficulty) |> Enum.at(0)
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("guess", payload, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> CanvasGame.guess(Map.get(payload, "guess"), socket.assigns.name)
      |> CanvasGame.touch_expires()
      |> Server.update_game()

    resp = Map.put(payload, "winner", game_room.game.winner)

    if game_room.game.winner != nil do
      cancel_timer(game_room)
    end

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
    round_time = Map.get(settings, "roundTime", 45)
    settings = Map.put(settings, "round_time", round_time)

    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.set_game(
        CanvasGame.new(%{name: name, type: type, words: words, settings: settings})
      )
      |> CanvasGame.change_word()
      |> CanvasGame.change_turn()
      |> CanvasGame.start_round()
      |> CanvasGame.touch_expires()
      |> Server.update_game()

    {:ok, time} = start_timer(game_room)

    broadcast(socket, "handle_new_game", %{
      "turn" => game_room.game.turn,
      "word" => game_room.game.word,
      "size" => CanvasGame.min_size(game_room),
      "players" => Lobby.players(game_room, "canvas"),
      "sync" => time,
      "settings" => %{roundTime: round_time}
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("switch_editable", _, socket) do
    switch_editable(socket.topic)
    {:noreply, socket}
  end

  @impl true
  def handle_in("next_turn", _, socket) do
    next_turn(socket.topic)
    {:noreply, socket}
  end

  def next_turn(topic) do
    Logger.debug("Next Turn called on #{topic}")

    game_room =
      Server.get_game(game_code(topic))
      |> CanvasGame.change_turn()
      |> CanvasGame.change_word()
      |> Server.update_game()

    broadcast_next_turn(game_room)
  end

  defp broadcast_next_turn(%GameRoom{} = game_room) do
    expires_in_sec = CanvasGame.seconds_until_expired(game_room.game.settings.round_time)

    topic = "#{@channel_name}#{game_room.room_name}"

    unless game_room.game.is_over or CanvasGame.is_expired(game_room, expires_in_sec) do
      {:ok, time} = start_timer(game_room)

      PartyGameWeb.Endpoint.broadcast(topic, "handle_new_game", %{
        "turn" => game_room.game.turn,
        "word" => game_room.game.word,
        "players" => Lobby.players(game_room, "canvas"),
        "isOver" => game_room.game.is_over,
        "sync" => time
      })
    else
      PartyGameWeb.Endpoint.broadcast(topic, "handle_quit", %{})
    end
  end

  def switch_editable(topic) do
    Logger.debug("Switch Turn called on #{topic}")

    game_room_original =
      Server.get_game(game_code(topic))

    game_room =
      CanvasGame.change_turn(game_room_original)
      |> CanvasGame.touch_expires()
      |> Server.update_game()

    if game_room_original.game.turn != game_room.game.turn do
      broadcast_next_turn(game_room)
    end
  end

  defp start_timer(%GameRoom{} = game_room) do

    game_code = "#{@channel_name}#{game_room.room_name}"

    Logger.debug("Starting timer with #{game_room.game.settings.round_time} seconds")

    f = if game_room.game.type == "canvas_alternate", do: :switch_editable, else: :next_turn

    PartyGame.PartyGameTimer.start_timer(game_code, game_room.game.settings.round_time * 1000, %{
      module: __MODULE__,
      function: f,
      args: [game_code]
    })
  end

  def leave(topic, name) do
    Logger.debug("ChannelWatcher Leave called: #{topic} name: #{name}")
    lobby = PartyGameWeb.LobbyChannel.channel_name()
    players = Map.keys(Presence.list("#{lobby}#{game_code(topic)}"))

    if players == [] do
      PartyGame.PartyGameTimer.cancel_timer(topic)
    end
  end

  defp cancel_timer(%GameRoom{} = game_room) do
    game_code = "#{@channel_name}#{game_room.room_name}"
    PartyGame.PartyGameTimer.cancel_timer(game_code)
  end
end
