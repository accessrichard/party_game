defmodule PartyGame.Games.Canvas.CanvasGame do
  alias PartyGame.Game.Canvas
  alias PartyGame.Game.GameRoom

  @word_path "./lib/party_game/games/canvas"

  def new(game, _options \\ %{}) do
    Canvas.create_game(%Canvas{}, game)
  end

  def change_turn(%GameRoom{} = game_room) do
    index = find_index_round_robin(game_room.players, &(game_room.game.turn == &1.name))
    turn = Enum.at(game_room.players, index)
    if turn == nil do
      %{game_room | game: %{game_room.game | over?: true}}
    else
      %{game_room | game: %{game_room.game | turn: turn.name, winner: nil}}
    end
  end

  def change_word(%GameRoom{} = game_room) do
    if game_room.game.words == [] do
      word = Enum.at(word(1, game_room.game.settings.difficulty), 0)
      %{game_room | game: %{game_room.game | word: word, winner: nil}}
    else
      index = find_index_round_robin(game_room.game.words, &(game_room.game.word == &1))
      over? = game_room.game.word != nil && index == 0
      word = Enum.at(game_room.game.words, index)
      %{game_room | game: %{game_room.game | word: word, winner: nil, over?: over?}}
    end
  end

  def start_round(%GameRoom{} = game_room) do
    %{game_room | game: %{game_room.game | round_started: true, winner: nil}}
  end

  def stop_round(%GameRoom{} = game_room) do
    %{game_room | game: %{game_room.game | round_started: false}}
  end

  def guess(%GameRoom{} = game_room, guess, player_name) do
    guesses = Map.get(game_room.game, :guesses, [])

    cond do
      equal(game_room.game.word, guess) ->
        %{
          game_room
          | game: %{
              game_room.game
              | guesses: [guess | guesses],
                winner: player_name,
                round_started: false
            }
        }

      true ->
        %{game_room | game: %{game_room.game | guesses: [guess | guesses]}}
    end
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

  def seconds_until_expired(time \\ 45) do
    max = Enum.max([time, 45]) * 2
    Enum.min([max, 300])
  end

  def expired?(%GameRoom{} = game_room, time \\ 45) do
    DateTime.diff(DateTime.utc_now, game_room.game.expires_at) > time
  end


  def word(count, difficulty) do
    file = if difficulty == "hard", do: "drawing_two_word.json", else: "drawings.json"

    json = File.read!(Path.join(@word_path, file))
    list = Jason.decode!(json)
    Enum.take_random(list, count)
  end

  def add_size(%GameRoom{} = game_room, name, size) do
    player = Enum.find(game_room.players, &(&1.name == name))

    case player do
      nil ->
        game_room

      p ->
        updated = PartyGame.Game.Player.apply_changeset(p, %{display_size: size})
        PartyGame.Lobby.update_player(game_room, updated)
    end
  end

  def min_size(%GameRoom{} = game_room) do
    Enum.reduce(game_room.players, [nil, nil], fn player, acc ->
      [x | [y | _]] = if player.display_size == [], do: [nil, nil], else: player.display_size
      [acc_x | [acc_y | _]] = acc
      [min(x, acc_x), min(y, acc_y)]
    end)
  end

  defp equal(word1, word2) do
    w1 = word1 |> String.downcase() |> String.trim()
    w2 = word2 |> String.downcase() |> String.trim()

    w1 == w2 or
      w1 == String.replace_suffix(w2, "s", "") or
      w2 == String.replace_suffix(w1, "s", "")
  end

  def find_index_round_robin(enumerable, fun) do
    result =
      Enumerable.reduce(enumerable, {:cont, {:not_found, 0}}, fn entry, {_, index} ->
        if fun.(entry), do: {:halt, {:found, index}}, else: {:cont, {:not_found, index + 1}}
      end)

    case elem(result, 1) do
      {:found, index} -> if index >= length(enumerable) - 1, do: 0, else: index + 1
      {:not_found, _} -> 0
    end
  end
end
