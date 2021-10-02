defmodule PartyGame.GameTest do
  alias PartyGame.GameRoom
  alias PartyGame.Game.Game
  alias PartyGame.Games.States

  use ExUnit.Case, async: true

  describe "game" do
    test "start_game/1 starts a game" do
      game = GameRoom.start_game(Game.new())
      assert %Game{started: true} = game
    end

    test "stop_game/1 stops a game" do
      game = GameRoom.stop_game(Game.new())
      assert %Game{started: false} = game
    end

    test "add_player/2 adds a player" do
      game = GameRoom.add_player(Game.new(), "richard")
      [head | _] = game.players
      assert head == "richard"
    end

    test "add_player/2 prevents duplicate players" do
      game = GameRoom.add_player(Game.new(), "richard")
      assert {:error, _} = GameRoom.add_player(game, "richard")
    end

    test "add_player/2 prevents blank players" do
      assert {:error, _} = GameRoom.add_player(Game.new(), "")
    end

    test "add_player/2 prevents adding players during active game" do
      game = GameRoom.start_game(Game.new(%{rounds: 3}))
      assert {:error, _} = GameRoom.add_player(game, "richard")
    end

    test "play game" do
      game =
        Game.new()
        |> GameRoom.gen_room_name()
        |> GameRoom.add_questions(States.new(%{rounds: 3}), "States")
        |> GameRoom.add_player("Richard")
        |> GameRoom.add_player("joe")
        |> GameRoom.start_round()

      [question | _] = game.questions
      {:win, game} = GameRoom.buzz(game, "Richard", question.correct)

      [question | _] = game.questions

      {:win, game} =
        GameRoom.start_round(game)
        |> GameRoom.buzz("joe", question.correct)

      [question | _] = game.questions

      {:win, game} =
        GameRoom.start_round(game)
        |> GameRoom.buzz("Richard", question.correct)

      [winner | _] = GameRoom.score(game)
      assert elem(winner, 0) == "Richard"
    end
  end
end
