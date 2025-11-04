defmodule PartyGameWeb.MultipleChoiceChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGame.{Server, Lobby}
  alias PartyGame.MultipleChoice.MultipleChoiceGame
  alias PartyGame.Game.GameRoom
  alias PartyGame.Games.GameList
  alias PartyGame.Game.MultipleChoice
  alias PartyGame.PartyGameTimer
  import PartyGameWeb.GameUtils

  @channel_name "game:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

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
  def handle_info({:after_join, :game_not_found}, socket) do
    lobby = PartyGameWeb.LobbyChannel.channel_name()

    game_code = "#{lobby}#{game_code(socket.topic)}"

    PartyGameWeb.Endpoint.broadcast(game_code, "handle_game_server_idle_timeout", %{
      "reason" => "Game Not Found"
    })

    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    config = Application.get_env(:party_game, PartyGameWeb.LobbyChannel)

    game_room = Server.get_game(game_code(socket.topic))

    if game_room.room_owner == socket.assigns.name do
      start_timer(
        game_room,
        config[:new_game_prompt_time] + config[:new_game_prompt_time_offset],
        :new_game_timeout
      )
    end

    {:noreply, socket}
  end

  @impl true
  def handle_in("start_round", _, socket) do
    start_round(socket.topic, %{from_handle_in?: true})
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_game", payload, socket) do
    Logger.debug("New Multiple Choice Game #{socket.topic}")
    client_form = Map.get(payload, "game")
    game_name = Map.get(client_form, "name")
    game_location = Map.get(client_form, "location")
    settings = Map.get(payload, "settings")
    rounds = Map.get(settings, "rounds", 10)
    server_game = Server.get_game(game_code(socket.topic))

    game_room =
      if game_location == "client" do
        multiple_choice = MultipleChoice.create_game(MultipleChoice.new(), client_form)
        %{server_game | game: multiple_choice}
      else
        multiple_choice = MultipleChoice.create_game(MultipleChoice.new(), %{})
        %{server_game | game: multiple_choice}
      end

    questions =
      MultipleChoiceGame.generate_questions(
        %{
          name: game_name,
          rounds: rounds,
          location: game_location,
          game_room: game_room
        },
        GameList.cached_game_list()
      )

    game_room =
      game_room
      |> Lobby.start_game()
      |> MultipleChoiceGame.new()
      |> MultipleChoiceGame.add_questions(questions, game_name)
      |> MultipleChoiceGame.update_settings(settings)
      |> MultipleChoiceGame.start_round()
      |> MultipleChoiceGame.touch_expires()
      |> Server.update_game()

    reply_with_questions(socket.topic, %{is_new?: true, game_room: game_room})
    {:noreply, socket}
  end

  @impl true
  def handle_in("next_question", _, socket) do
    next_question(socket.topic, %{from_handle_in?: true})
    {:noreply, socket}
  end

  @impl true
  def handle_in("quit_game", _, socket) do
    broadcast(socket, "quit_game", %{})
    {:noreply, socket}
  end

  @impl true
  def handle_in("answer_click", payload, socket) do
    game_room = Server.get_game(game_code(socket.topic))
    answer = Map.get(payload, "answer")
    guid = Map.get(payload, "id")

    case MultipleChoiceGame.buzz(game_room, socket.assigns.name, answer, guid) do
      {:win, game_room} ->
        broadcast_correct_answer(game_room, answer, socket)

      {:noreply, _} ->
        :ok

      _ ->
        push(socket, "handle_wrong_answer", %{isCorrect: false})
    end

    MultipleChoiceGame.touch_expires(game_room)
    Server.update_game(game_room)
    {:noreply, socket}
  end

  @impl true
  def handle_in("ping", _, socket) do
    Server.ping(game_code(socket.topic))
    {:noreply, socket}
  end

  def start_round(topic) do
    start_round(topic, %{from_handle_in?: true})
  end

  def start_round(topic, %{from_handle_in?: is_from_handle_in?}) do
    Logger.debug("Start Round called on #{topic}")

    game_room =
      Server.get_game(game_code(topic))
      |> MultipleChoiceGame.start_round()

    game_room =
      if is_from_handle_in?, do: MultipleChoiceGame.touch_expires(game_room), else: game_room

    Server.update_game(game_room)

    reply_with_questions(topic, %{is_new?: false, game_room: game_room})
  end

  defp broadcast_correct_answer(game_room, answer, socket) do
    cancel_timer(game_room)

    case start_timer(game_room, game_room.game.settings.next_question_time, :next_question) do
      {:ok, time} ->
        broadcast(
          socket,
          "handle_correct_answer",
          %{
            startRoundTimeSync: time,
            data: %{
              rounds: if(game_room.is_over, do: game_room.game.rounds, else: []),
              answer: answer,
              winner: socket.assigns.name,
              isOver: game_room.is_over
            }
          }
        )

      {:timeout, nil} ->
        kill_game(game_code(socket.topic))
    end
  end

  defp kill_game(game_code) do
    lobby = PartyGameWeb.LobbyChannel.channel_name()

    PartyGameWeb.Endpoint.broadcast!(
      "#{lobby}#{game_code}",
      "handle_game_server_idle_timeout",
      %{"reason" => "Game timeout - No input for multiple rounds."}
    )

    Server.stop(game_code)
  end

  def new_game_timeout(topic) do
    game_room =
      Server.get_game(game_code(topic))

    unless game_room.started do
      PartyGameWeb.Endpoint.broadcast(
        topic,
        "new_game_timeout",
        %{isNewGameTimeout: true}
      )
    end
  end

  def next_question(topic) do
    next_question(topic, %{from_handle_in?: false})
  end

  def next_question(topic, %{from_handle_in?: from_handle_in?}) do
    game_room =
      Server.get_game(game_code(topic))
      |> MultipleChoiceGame.next_question()
      |> MultipleChoiceGame.start_round()

    game_room =
      if from_handle_in?, do: MultipleChoiceGame.touch_expires(game_room), else: game_room

    Server.update_game(game_room)

    question = get_next_question(game_room)

    resp = %{
      data: %{
        isOver: game_room.is_over,
        question: question.question,
        answers: question.answers,
        id: question.id
      }
    }

    broadcast_next_question(topic, game_room, resp)
  end

  defp reply_with_questions(topic, %{is_new?: isNew, game_room: game_room}) do
    [question | _] = game_room.game.questions
    resp = %{"data" => question, "isNew" => isNew}

    resp = if isNew, do: add_settings(game_room, resp), else: resp

    broadcast_next_question(topic, game_room, resp)
  end

  defp add_settings(game_room, resp) do
    Map.put(resp, "settings", game_room.game.settings)
  end

  defp broadcast_next_question(topic, game_room, resp) do
    seconds =
      MultipleChoiceGame.seconds_until_question_expired(game_room.game.settings.question_time)

    case start_timer(game_room, seconds, :next_question) do
      {:ok, time} ->
        Map.put(resp, :startRoundTimeSync, time)

        PartyGameWeb.Endpoint.broadcast(topic, "handle_next_question", resp)

      {:timeout, nil} ->
        kill_game(game_code(topic))
    end
  end

  defp get_next_question(%GameRoom{} = game_room) when game_room.game.questions == [] do
    %{question: "", answers: [], id: Ecto.UUID.autogenerate()}
  end

  defp get_next_question(%GameRoom{} = game_room) do
    [question | _] = game_room.game.questions
    question
  end

  defp start_timer(%GameRoom{} = game_room, seconds, func) do
    game_code = "#{@channel_name}#{game_room.room_name}"
    Logger.debug("Starting timer on #{game_code} with #{seconds} seconds")

    unless MultipleChoiceGame.is_expired?(game_room) do
      PartyGameTimer.start_timer(game_code, seconds * 1000, %{
        module: __MODULE__,
        function: func,
        args: [game_code]
      })
    else
      Logger.debug(
        "Timer expired. #{game_room.game.expires_at} Skipping on multiple choice: #{game_code}"
      )

      {:timeout, nil}
    end
  end

  defp cancel_timer(%GameRoom{} = game_room) do
    game_code = "#{@channel_name}#{game_room.room_name}"
    PartyGame.PartyGameTimer.cancel_timer(game_code)
  end
end
