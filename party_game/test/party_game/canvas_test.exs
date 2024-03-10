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

    test "guess/3 adds a guess" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe", word: "abc"}))
        |> CanvasGame.guess("test", "joe")
        |> CanvasGame.guess("test2", "joe")

        [guess | _] = game_room.game.guesses
        assert guess === "test2"
    end

    test "guess/3 sets game winner" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe", word: "test"}))
        |> CanvasGame.guess("test", "joe")
        |> CanvasGame.guess("test2", "joe2")

        assert "joe" == game_room.game.winner
    end


    test "add_size/2 adds a player display size" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> Lobby.add_player("rich1")
        |> Lobby.add_player("rich2")
        |> CanvasGame.add_size("rich1", [520.3, 835.94])

        player = Enum.find(game_room.players, &(&1.name == "rich1"))
        [h | [t | _]] = assert player.display_size

        assert h == 520.3 && t == 835.94
    end

    test "min_size/2 gets min display size" do
      min_size =
        Lobby.new()
        |> Lobby.set_game(CanvasGame.new(%{name: "free_draw", turn: "joe"}))
        |> Lobby.add_player("rich1")
        |> Lobby.add_player("rich2")
        |> Lobby.add_player("rich3")
        |> CanvasGame.add_size("rich1", [520.3, 835.94])
        |> CanvasGame.add_size("rich2", [50, 8333.94])
        |> CanvasGame.add_size("rich3", [400, 500])
        |> CanvasGame.min_size()

        [h | [t | _]] = min_size
        assert h == 50 && t == 500
    end

  end
end
