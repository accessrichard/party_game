defmodule PartyGame.MultipleChoice.MultipleChoiceGame do
  alias PartyGame.Game.MultipleChoice
  alias PartyGame.Game.MultipleChoiceSettings
  alias PartyGame.Game.Round
  alias PartyGame.Game.GameRoom

  def new(%GameRoom{} = game_room) do
    %{game_room | game: MultipleChoice.new()}
  end

  def add_questions(%GameRoom{} = game_room, questions, name \\ "Game") do
    %{game_room | game: %{game_room.game | questions: questions, name: name}}
  end

  def update_settings(%GameRoom{} = game_room, settings) do
    game_settings = MultipleChoiceSettings.apply_settings(game_room.game.settings, settings)
    game = %{game_room.game | settings: game_settings}
    %{game_room | game: game}
  end

  def end_game(%GameRoom{} = game_room) do
    %{game_room | over?: true, started: false, game: %{game_room.game | round_started: false}}
  end

  def score(%GameRoom{} = game_room) do
    scores =
      Enum.reduce(game_room.game.rounds, %{}, fn round, acc ->
        Map.put(acc, round.winner, Map.get(acc, round.winner, 0) + 1)
      end)

    Enum.sort_by(scores, &elem(&1, 1), :desc)
  end

  def start_round(%GameRoom{} = game_room) do
    case game_room.game.questions == [] do
      true ->
        end_game(game_room)

      false ->
        %{game_room | game: %{game_room.game | round_started: true}}
    end
  end

  def win_round?(%GameRoom{} = game_room, answer) do
    game = game_room.game
    [question | _] = game.questions
    question.correct == answer and game.round_started
  end

  @doc """
  Handles cases where a users network connection is slower
  than anothers. By the time the answer_click reaches the server
  the game already advanced rounds, tracking questions
  via guid.
  """
  def buzz(%GameRoom{} = game_room, _, _, _) when game_room.game.questions == [] do
    {:noreply, game_room}
  end

  def buzz(%GameRoom{} = game_room, player_name, answer, guid) do
    [question | _] = game_room.game.questions

    if guid == question.id do
      buzz(game_room, player_name, answer)
    else
      {:noreply, game_room}
    end
  end

  def buzz(%GameRoom{} = game_room, player_name, answer) do
    cond do
      win_round?(game_room, answer) ->
        [question | questions] = game_room.game.questions
        round = %Round{question: question, winner: player_name, answer: question.correct}

        {:win,
         %{
           game_room
           | over?: questions == [],
             started: game_room.started && questions != [],
             game: %{
               game_room.game
               | round_started: false,
                 rounds: [round | game_room.game.rounds],
                 questions: questions
             }
         }}

      true ->
        {:lose, game_room}
    end
  end

  def next_question(%GameRoom{} = game_room) do
    case game_room.game.questions == [] do
      true ->
        end_game(game_room)

      false ->
        take_next_question(game_room)
    end
  end

  def generate_questions(game, game_list) do
    name = Map.get(game, :name)
    location = Map.get(game, :location)

    game_metadata =
      Enum.find(game_list, fn x ->
        (x.name == name and x.location == location) or
          (x.location == location and location == "client")
      end)

    num_rounds = Map.get(game, :rounds, 10)

    case game_metadata do
      nil ->
        {:error, "Game does not exist!"}

      _ ->
        questions = game_metadata.module.new(game, Map.get(game_metadata, :options, %{}))

        if location == "client" ||
             game_metadata.module === PartyGame.Games.MultipleChoice.BuildYourOwnPrebuilt do
          shuffle_questions(questions)
          |> Enum.take(num_rounds)
          |> shuffle_question_answers()
        else
          Enum.take_random(questions, num_rounds)
        end
    end
  end

  defp shuffle_questions(questions) do
    Enum.shuffle(questions)
  end

  defp shuffle_question_answers(questions) do
    Enum.map(questions, fn x ->
      if length(x.answers) > 2 do
        %{x | answers: Enum.shuffle(x.answers)}
      else
        x
      end
    end)
  end

  defp take_next_question(%GameRoom{} = game_room) do
    [question | questions] = game_room.game.questions
    round = %Round{question: question, winner: "None", answer: question.correct}

    %{
      game_room
      | over?: questions == [],
        started: questions == [],
        game: %{
          game_room.game
          | round_started: false,
            rounds: [round | game_room.game.rounds],
            questions: questions
        }
    }
  end

  def touch_expires(%GameRoom{} = game_room) do
    %{
      game_room
      | game: %{
          game_room.game
          | expires_at: DateTime.utc_now()
        }
    }
  end

  def seconds_until_question_expired(time \\ 10) do
    max = Enum.max([time, 5])
    Enum.min([max, 60])
  end

  def expired?(game, time \\ 60)

  def expired?(%PartyGame.Game.GameRoom{game: %{expires_at: expires_at}}, time) do
    IO.inspect("Here")
    DateTime.diff(DateTime.utc_now(), expires_at) > time
  end

  def expired?(_game, _time) do
    IO.inspect("there")
    false
  end
end
