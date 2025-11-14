defmodule PartyGame.Games.Hangman.HangmanGame do
  alias PartyGame.Game.Hangman
  alias PartyGame.Game.GameRoom
  alias PartyGame.Lobby

  def new(game, _options \\ %{}) do
    Hangman.create_game(%Hangman{}, game)
  end

  def guess(%GameRoom{} = game_room, guess) do
    guesses = [guess | game_room.game.guesses]

    %{
      game_room
      | game: %{
          game_room.game
          | guesses: guesses,
            display_word: display_word(game_room.game.word, guesses)
        }
    }
  end

  def wrong_guesses(game_room) do
    Enum.reduce(game_room.game.guesses, [], fn guess, acc ->
      unless String.contains?(trim_to_lower(game_room.game.word), trim_to_lower(guess)) do
        [guess | acc]
      else
        acc
      end
    end)
  end

  def display_word(word, guesses) do
    Enum.reduce(
      String.codepoints(word),
      [],
      fn x, acc ->
        if Enum.any?([" " | guesses], &compare(&1, x)) do
          [x | acc]
        else
          ["_" | acc]
        end
      end
    )
    |> Enum.reverse()
    |> List.to_string()
  end

  defp compare(letter1, letter2) do
    trim_to_lower(letter1) == trim_to_lower(letter2)
  end

  defp trim_to_lower(word) do
    word |> String.downcase() |> String.trim()
  end

  def change_word(%GameRoom{} = game_room) do
    if game_room.game.words == [] do
      word = Enum.at(word(1, game_room.game.settings.difficulty), 0)

      %{
        game_room
        | game: %{
            game_room.game
            | word: word,
              display_word: display_word(word, []),
              over?: false
          }
      }
    else
      index =
        Lobby.find_index_round_robin(game_room.game.words, &(game_room.game.word == &1))

      over? = game_room.game.word != nil && index == 0
      word = Enum.at(game_room.game.words, index)

      %{
        game_room
        | game: %{
            game_room.game
            | word: word,
              display_word: display_word(word, []),
              over?: over?
          }
      }
    end
  end

  def winner?(%GameRoom{} = game_room) do
    not String.contains? game_room.game.display_word, "_"
  end

  def word(count, difficulty \\ "easy") do
    PartyGame.Games.Canvas.CanvasGame.word(count, difficulty)
  end

end
