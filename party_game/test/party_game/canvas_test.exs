defmodule PartyGame.CanvasTest do
  alias PartyGame.Games.Canvas.CanvasGame
  alias PartyGame.Lobby
  use ExUnit.Case, async: true

  describe "Canvas tests" do
    test "word/1 generates random word" do
      assert CanvasGame.word(1) |> Enum.at(0) != CanvasGame.word(1) |> Enum.at(0)
    end

    test "change_turn/0 changes turns" do
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

    test "change_word/0 changes words" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> CanvasGame.chanage_word()

        word = game_room.game.word
        assert word !==  CanvasGame.chanage_word(game_room).game.word
    end


  end
end
