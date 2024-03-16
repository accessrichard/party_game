defmodule PartyGame.MultipleChoiceGameTest do
  alias PartyGame.Game.MultipleChoiceSettings
  alias PartyGame.Game.{GameRoom, MultipleChoice}
  alias PartyGame.MultipleChoice.MultipleChoiceGame
  alias PartyGame.Games.MultipleChoice.States
  alias PartyGame.Lobby

  use ExUnit.Case, async: true

  describe "game" do
    test "start_game/1 starts a game" do
      game = Lobby.start_game(%GameRoom{game: MultipleChoice.new()})
      assert %GameRoom{started: true} = game
    end

    test "stop_game/1 stops a game" do
      game = Lobby.stop_game(%GameRoom{game: MultipleChoice.new()})
      assert %GameRoom{started: false} = game
    end

    test "add_settings/2" do
      game_room = GameRoom.new(game: %MultipleChoice{settings: %MultipleChoiceSettings{}})
      game_room = Lobby.update_settings(game_room, %{question_time: 10})
      assert game_room.game.settings !== nil
    end

    test "play game" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(%MultipleChoice{})
        |> Lobby.gen_room_name()
        |> Lobby.add_player("Richard")
        |> Lobby.add_player("joe")
        |> MultipleChoiceGame.add_questions(States.new(%{rounds: 3}), "States")
        |> MultipleChoiceGame.start_round()

      [question | _] = game_room.game.questions
      {:win, game_room} = MultipleChoiceGame.buzz(game_room, "Richard", question.correct)

      [question | _] = game_room.game.questions

      {:win, game_room} =
        MultipleChoiceGame.start_round(game_room)
        |> MultipleChoiceGame.buzz("joe", question.correct)

      [question | _] = game_room.game.questions

      {:win, game_room} =
        MultipleChoiceGame.start_round(game_room)
        |> MultipleChoiceGame.buzz("Richard", question.correct)

      [winner | _] = MultipleChoiceGame.score(game_room)
      assert elem(winner, 0) == "Richard"
    end
  end
end
