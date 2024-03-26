defmodule PartyGame.HangmanTest do
  alias PartyGame.Games.Hangman.HangmanGame
  alias PartyGame.Lobby
  use ExUnit.Case, async: true

  describe "Hangman tests" do
    test "word/1 generates random word" do
      assert HangmanGame.word(1) |> Enum.at(0) != HangmanGame.word(1) |> Enum.at(0)
    end

    test "wrong_guess/1 adds wrong guess" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(HangmanGame.new(%{word: "test", guesses: ["t", "z"]}))

      wrong = HangmanGame.wrong_guesses(game_room)
      assert wrong == ["z"]
    end

    test "change_word/1 changes words" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(HangmanGame.new(%{}))
        |> HangmanGame.change_word()

      word = game_room.game.word
      assert word !== HangmanGame.change_word(game_room).game.word
    end

    test "guess/2 adds a guess" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(HangmanGame.new(%{word: "abc"}))
        |> HangmanGame.guess("a")
        |> HangmanGame.guess("g")

      [guess | _] = game_room.game.guesses
      assert guess === "g"
    end

    test "guess/2 sets display word" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(HangmanGame.new(%{word: "test man"}))
        |> HangmanGame.guess("t")
        |> HangmanGame.guess("a")

      assert "t__t _a_" == game_room.game.display_word
    end
  end
end
