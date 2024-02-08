defmodule PartyGame.GameRoom do
  alias PartyGame.Game
  alias PartyGame.Game.Settings
  alias PartyGame.Game.Round
  alias PartyGame.Game.Player
  alias PartyGame.Server
  alias PartyGame.Game.Game

  def gen_room_name(%Game{} = game) do
    %{game | room_name: Server.room_name()}
  end

  def add_player(%Game{} = game, %{} = player) do
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

  def add_player(%Game{} = game, player_name) do
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

  def add_player!(%Game{} = game, player_name) do
    with %Game{} = game <- add_player(game, player_name) do
      game
    else
      error -> raise error
    end
  end

  def update_settings(%Game{} = game, settings) do
    %{game | settings: Settings.apply_settings(game.settings, settings)}
  end

  def name_taken(%Game{} = game, player_name) do
    case player_exists?(game, player_name) do
      false -> {:ok, player_name}
      true -> {:error, %{player_name: "Name taken. Choose a different name."}}
    end
  end

  def player_exists?(%Game{} = game, player_name) do
    case Enum.find(game.players, fn player -> player.name == player_name end) do
      nil -> false
      _ -> true
    end
  end

  def add_questions(%Game{} = game, questions, name \\ "Game") do
    %{game | questions: questions, name: name}
  end

  def remove_player(%Game{} = game, player_name) do
    %{game | players: Enum.filter(game.players, &(&1.name !== player_name))}
  end

  def start_game(%Game{} = game) do
    %{game | started: true, rounds: []}
  end

  def stop_game(%Game{} = game) do
    %{game | started: false}
  end

  def end_game(%Game{} = game) do
    %{game | is_over: true, started: false, round_started: false}
  end

  def score(%Game{} = game) do
    scores =
      Enum.reduce(game.rounds, %{}, fn round, acc ->
        Map.put(acc, round.winner, Map.get(acc, round.winner, 0) + 1)
      end)

    Enum.sort_by(scores, &elem(&1, 1), :desc)
  end

  def start_round(%Game{} = game) do
    case game.questions == [] do
      true ->
        end_game(game)

      false ->
        %{game | round_started: true}
    end
  end

  def update_player(%Game{} = game, %Player{} = player) do
    %{
      game
      | players:
          Enum.map(game.players, fn p ->
            if p.name == player.name, do: player, else: p
          end)
    }
  end

  def update_room_owner(%Game{} = game, owner) do
    %{game | room_owner: owner}
  end

  def get_player(%Game{} = game, player) do
    Enum.find(game.players, &(&1.name == player.name))
  end

  def win_round?(%Game{} = game, answer) do
    [question | _] = game.questions
    question.correct == answer and game.round_started
  end

  @doc """
  Handles cases where a users network connection is slower
  than anothers. By the time the answer_click reaches the server
  the game already advanced rounds, tracking questions
  via guid.
  """
  def buzz(%Game{} = game, _, _, _) when game.questions == [] do
    {:noreply, game}
  end

  def buzz(%Game{} = game, player_name, answer, guid)  do
    [question | _] = game.questions
    if guid == question.id do
      buzz(game, player_name, answer)
    else
      {:noreply, game}
    end
  end

  def buzz(%Game{} = game, player_name, answer) do
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

  def next_question(%Game{} = game) do
    case game.questions == [] do
      true ->
        end_game(game)

      false ->
        take_next_question(game)
    end
  end

  defp take_next_question(%Game{} = game) do
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
