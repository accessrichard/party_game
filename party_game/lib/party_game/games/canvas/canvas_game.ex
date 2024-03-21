defmodule PartyGame.Games.Canvas.CanvasGame do
  alias PartyGame.Game.Canvas
  alias PartyGame.Game.GameRoom

  @word_path "./lib/party_game/games/canvas"

  def new(game, _options \\ %{}) do
    Canvas.create_game(%Canvas{}, game)
  end

  def change_turn(%GameRoom{} = game_room) do
    index = Enum.find_index(game_room.players, &(game_room.game.turn == &1.name))
    index = if index == nil, do: 0, else: index + 1
    index = if index > length(game_room.players) - 1, do: 0, else: index
    turn = Enum.at(game_room.players, index)
    %{game_room | game: %{game_room.game | turn: turn.name, winner: nil}}
  end

  def change_word(%GameRoom{} = game_room) do
    word = if game_room.game.words == []  do
      Enum.at(word(1, game_room.game.settings.difficulty), 0)
    else
      index = get_index(game_room.game.words, Map.get(game_room.game, :word, ""))
      Enum.at(game_room.game.words, index)
    end

    %{game_room | game: %{game_room.game | word: word, winner: nil}}
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
          | game: %{game_room.game | guesses: [guess | guesses],
            winner: player_name,
            round_started: false}
        }

      true ->
        %{game_room | game: %{game_room.game | guesses: [guess | guesses]}}
    end
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
    w1 = word1 |> String.downcase |> String.trim()
    w2 = word2 |> String.downcase |> String.trim()
    w1 == w2
    or w1 == String.replace_suffix(w2, "s", "")
    or w2 == String.replace_suffix(w1, "s", "")
  end

  defp get_index(words, word) when is_list(words) do
    index = words |> Enum.with_index() |> Enum.find(fn {w, _} -> w == word end)
    case index do
      {_, idx} ->  if idx >= length(words) - 1, do: 0, else: idx + 1
      nil -> 0
    end
  end
end
