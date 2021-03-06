defmodule PartyGame.Game do
  alias PartyGame.Game
  alias PartyGame.Round
  alias PartyGame.Server

  defstruct players: [],
            rounds: [],
            started: false,
            round_started: false,
            room_name: nil,
            room_owner: nil,
            game: nil,
            is_over: false,
            questions: []

  def new(fields \\ []), do: __struct__(fields)

  def gen_room_name(%Game{} = game) do
    %{game | room_name: Server.room_name()}
  end

  def add_player(%Game{} = game, player_name) do
    with {:ok, _} <- game_stopped(game),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game, player_name) do
      %{game | players: [player_name | game.players], room_owner: game.room_owner || player_name}
    else
      error -> error
    end
  end

  def add_player!(%Game{} = game, player_name) do
    with  %Game{} = game <- add_player(game, player_name) do
      game
    else
      error -> raise error
    end
  end

  def add_questions(%Game{} = game, questions, name \\ "Game") do
    %{game | questions: questions, game: name}
  end

  def remove_player(%Game{} = game, player_name) do
    %{game | players: Enum.filter(game.players, &(&1 !== player_name))}
  end

  def start_game(%Game{} = game) do
    %{game | started: true}
  end

  def stop_game(%Game{} = game) do
    %{game | started: false}
  end

  def score(%Game{} = game) do
    scores =
      Enum.reduce(game.rounds, %{}, fn round, acc ->
        Map.put(acc, round.winner, Map.get(acc, round.winner, 0) + 1)
      end)

    Enum.sort_by(scores, &elem(&1, 1), :desc)
  end

  def start_round(%Game{} = game) do
    %{game | round_started: true}
  end

  def win_round?(%Game{} = game, answer) do
    [question | _] = game.questions
    question.correct == answer and game.round_started
  end

  def buzz(%Game{} = game, player_name, answer) do
    cond do
      win_round?(game, answer) ->
        [question | questions] = game.questions
        round = %Round{question: question, winner: player_name, answer: question.correct}
        {:win, %{game | round_started: false, rounds: [round | game.rounds], questions: questions, is_over: questions == []}}

      true ->
        {:lose, game}
    end
  end

  def next_question(%Game{} = game) do
    [question | questions] = game.questions
    round = %Round{question: question, winner: "None", answer: question.correct}
    %{game | round_started: false, rounds: [round | game.rounds], questions: questions, is_over: questions == []}
  end

  def name_taken(%Game{} = game, player_name) do
    case player_exists?(game, player_name) do
      false -> {:ok, player_name}
      true -> {:error, "Name taken. Choose a different name."}
    end
  end

  def player_exists?(%Game{} = game, player_name) do
    case Enum.find(game.players, fn player -> player == player_name end) do
      nil -> false
      _ -> true
    end
  end

  defp game_stopped(%{started: true}), do: {:error, "Game is already started."}
  defp game_stopped(%{started: false}), do: {:ok, false}

  defp required(nil, field), do: {:error, "#{field} is required"}
  defp required("", field), do: required(nil, field)
  defp required(name, _field), do: {:ok, name}
end
