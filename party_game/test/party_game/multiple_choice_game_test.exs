defmodule PartyGame.MultipleChoiceGameTest do
  alias PartyGame.GameRoom
  alias PartyGame.Game.MultipleChoice
  alias PartyGame.Game.Player
  alias PartyGame.Games.MultipleChoice.States

  use ExUnit.Case, async: true

  describe "game" do
    test "start_game/1 starts a game" do
      game = GameRoom.start_game(MultipleChoice.new())
      assert %MultipleChoice{started: true} = game
    end

    test "stop_game/1 stops a game" do
      game = GameRoom.stop_game(MultipleChoice.new())
      assert %MultipleChoice{started: false} = game
    end

    test "add_player/2 adds a player" do
      game = GameRoom.add_player(MultipleChoice.new(), "richard")
      [head | _] = game.players
      assert head.name == "richard"
    end

    test "update_player/2 update a player" do
      game = GameRoom.add_player(MultipleChoice.new(), "richard")
      |> GameRoom.add_player("Sue")
      |> GameRoom.update_player(%Player{name: "Sue", wins: 1})

      all_updated = Enum.filter(game.players, fn x -> x.wins == 1 end)
      [player | _] = all_updated
      assert length(all_updated) == 1 && player.name == "Sue"
    end

    test "add_player/2 prevents duplicate players" do
      game = GameRoom.add_player(MultipleChoice.new(), "richard")
      assert {:error, _} = GameRoom.add_player(game, "richard")
    end

    test "add_settings/2 prevents duplicate players" do
      game = GameRoom.update_settings(PartyGame.Game.MultipleChoice.new, %{question_time: 10})
      assert game.settings !== nil
    end

    test "add_player/2 prevents blank players" do
      assert {:error, _} = GameRoom.add_player(MultipleChoice.new(), "")
    end

    test "add_player/2 prevents adding players during active game" do
      game = GameRoom.start_game(MultipleChoice.new(%{rounds: 3}))
      assert {:error, _} = GameRoom.add_player(game, "richard")
    end

    test "play game" do
      game =
        MultipleChoice.new()
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
