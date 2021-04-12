defmodule PartyGame.GameTest do
  alias PartyGame.Game
  alias PartyGame.Games.States

  use ExUnit.Case, async: true

  describe "game" do
    test "start_game/1 starts a game" do
      game = Game.start_game(Game.new())
      assert %Game{started: true} = game
    end

    test "stop_game/1 stops a game" do
      game = Game.stop_game(Game.new())
      assert %Game{started: false} = game
    end

    test "add_player/2 adds a player" do
      game = Game.add_player(Game.new(), "richard")
      [head | _] = game.players
      assert head == "richard"
    end

    test "add_player/2 prevents duplicate players" do
      game = Game.add_player(Game.new(), "richard")
      assert {:error, _} = Game.add_player(game, "richard")
    end

    test "add_player/2 prevents blank players" do
      assert {:error, _} = Game.add_player(Game.new(), "")
    end

    test "add_player/2 prevents adding players during active game" do
      game = Game.start_game(Game.new())
      assert {:error, _} = Game.add_player(game, "richard")
    end

    test "play game" do
      game =
        Game.new()
        |> Game.gen_room_name()
        |> Game.add_questions(States.new(3), "States")
        |> Game.add_player("Richard")
        |> Game.add_player("joe")
        |> Game.start_round()

      [question | _] = game.questions
      {:win, game} = Game.buzz(game, "Richard", question.correct)

      [question | _] = game.questions

      {:win, game} =
        Game.start_round(game)
        |> Game.buzz("joe", question.correct)

      [question | _] = game.questions

      {:win, game} =
        Game.start_round(game)
        |> Game.buzz("Richard", question.correct)

      [winner | _] = Game.score(game)
      assert elem(winner, 0) == "Richard"
    end
  end
end
