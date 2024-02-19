defmodule PartyGame.GameRoom do
  alias PartyGame.Game.MultipleChoiceSettings
  alias PartyGame.Game.Round
  alias PartyGame.Game.Player
  alias PartyGame.Server
  alias PartyGame.Game.MultipleChoice

  def gen_room_name(%MultipleChoice{} = game) do
    %{game | room_name: Server.room_name()}
  end

  def add_player(%MultipleChoice{} = game, %{} = player) do
    player_name = Map.get(player, "name")

    with {:ok, _} <- game_stopped(game),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game, player_name) do
      %{
        game
        | players: [Player.add_player(player) | game.players],
          room_owner: game.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player(%MultipleChoice{} = game, player_name) do
    with {:ok, _} <- game_stopped(game),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game, player_name) do
      %{
        game
        | players: [Player.add_player(player_name) | game.players],
          room_owner: game.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player!(%MultipleChoice{} = game, player_name) do
    with %MultipleChoice{} = game <- add_player(game, player_name) do
      game
    else
      error -> raise error
    end
  end

  def update_settings(%MultipleChoice{} = game, settings) do
    %{game | settings: MultipleChoiceSettings.apply_settings(game.settings, settings)}
  end

  def name_taken(%MultipleChoice{} = game, player_name) do
    case player_exists?(game, player_name) do
      false -> {:ok, player_name}
      true -> {:error, %{player_name: "Name taken. Choose a different name."}}
    end
  end

  def player_exists?(%MultipleChoice{} = game, player_name) do
    case Enum.find(game.players, fn player -> player.name == player_name end) do
      nil -> false
      _ -> true
    end
  end

  def add_questions(%MultipleChoice{} = game, questions, name \\ "Game") do
    %{game | questions: questions, name: name}
  end

  def remove_player(%MultipleChoice{} = game, player_name) do
    %{game | players: Enum.filter(game.players, &(&1.name !== player_name))}
  end

  def start_game(%MultipleChoice{} = game) do
    %{game | started: true, rounds: []}
  end

  def stop_game(%MultipleChoice{} = game) do
    %{game | started: false}
  end

  def end_game(%MultipleChoice{} = game) do
    %{game | is_over: true, started: false, round_started: false}
  end

  def score(%MultipleChoice{} = game) do
    scores =
      Enum.reduce(game.rounds, %{}, fn round, acc ->
        Map.put(acc, round.winner, Map.get(acc, round.winner, 0) + 1)
      end)

    Enum.sort_by(scores, &elem(&1, 1), :desc)
  end

  def start_round(%MultipleChoice{} = game) do
    case game.questions == [] do
      true ->
        end_game(game)

      false ->
        %{game | round_started: true}
    end
  end

  def update_player(%MultipleChoice{} = game, %Player{} = player) do
    %{
      game
      | players:
          Enum.map(game.players, fn p ->
            if p.name == player.name, do: player, else: p
          end)
    }
  end

  def update_room_owner(%MultipleChoice{} = game, owner) do
    %{game | room_owner: owner}
  end

  def get_player(%MultipleChoice{} = game, player) do
    Enum.find(game.players, &(&1.name == player.name))
  end

  def win_round?(%MultipleChoice{} = game, answer) do
    [question | _] = game.questions
    question.correct == answer and game.round_started
  end

  @doc """
  Handles cases where a users network connection is slower
  than anothers. By the time the answer_click reaches the server
  the game already advanced rounds, tracking questions
  via guid.
  """
  def buzz(%MultipleChoice{} = game, _, _, _) when game.questions == [] do
    {:noreply, game}
  end

  def buzz(%MultipleChoice{} = game, player_name, answer, guid)  do
    [question | _] = game.questions
    if guid == question.id do
      buzz(game, player_name, answer)
    else
      {:noreply, game}
    end
  end

  def buzz(%MultipleChoice{} = game, player_name, answer) do
    cond do
      win_round?(game, answer) ->
        [question | questions] = game.questions
        round = %Round{question: question, winner: player_name, answer: question.correct}

        {:win,
         %{
           game
           | round_started: false,
             rounds: [round | game.rounds],
             questions: questions,
             is_over: questions == [],
             started: game.started && questions != []
         }}

      true ->
        {:lose, game}
    end
  end

  def next_question(%MultipleChoice{} = game) do
    case game.questions == [] do
      true ->
        end_game(game)

      false ->
        take_next_question(game)
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
        questions = game_metadata.module.new(game, Map.get(game_metadata, "options", %{}))

        # Shuffle questions for client games
        if location == "client" || game_metadata.module === Games.BuildYourOwnPrebuilt do
          shuffle_questions(questions)
          |> shuffle_question_answers()
          |> Enum.take(num_rounds)
        else
          Enum.take(questions, num_rounds)
        end
    end
  end

  defp shuffle_questions(questions) do
    Enum.shuffle(questions)
  end

  defp shuffle_question_answers(questions) do
    Enum.map(questions, fn x ->
      if length(x.answers) > 2 do
        %PartyGame.Game.Question{x | answers: Enum.shuffle(x.answers)}
      else
        x
      end
    end)
  end

  defp take_next_question(%MultipleChoice{} = game) do
    [question | questions] = game.questions
    round = %Round{question: question, winner: "None", answer: question.correct}

    %{
      game
      | round_started: false,
        rounds: [round | game.rounds],
        questions: questions,
        is_over: questions == [],
        started: questions == []
    }
  end

  defp game_stopped(%{started: true}), do: {:error, "Game is already started."}
  defp game_stopped(%{started: false}), do: {:ok, false}

  defp required(nil, field), do: {:error, "#{field} is required"}
  defp required("", field), do: required(nil, field)
  defp required(name, _field), do: {:ok, name}
end
