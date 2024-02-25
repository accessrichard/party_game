defmodule PartyGame.CanvasTest do
  alias PartyGame.Games.Canvas.CanvasGame
  alias PartyGame.Lobby
  use ExUnit.Case, async: true

  describe "Canvas tests" do
    test "word/1 generates random word" do
      assert CanvasGame.word(1) |> Enum.at(0) != CanvasGame.word(1) |> Enum.at(0)
    end

    test "change_turn/1 changes turns" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> Lobby.add_player("Richard")
        |> Lobby.add_player("joe")
        |> Lobby.add_player("mike")
        |> CanvasGame.change_turn() #Richard
        |> CanvasGame.change_turn() #mike
        |> CanvasGame.change_turn() #joe
        |> CanvasGame.change_turn() #Richard

        assert game_room.game.turn == "Richard"
    end

    test "change_word/1 changes words" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> CanvasGame.change_word()

        word = game_room.game.word
        assert word !==  CanvasGame.change_word(game_room).game.word
    end

    test "add_guess/2 adds a guess" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> CanvasGame.add_guess("test")
        |> CanvasGame.add_guess("test2")

        [guess | _] = game_room.game.guesses
        assert guess === "test2"
    end


  end
end
