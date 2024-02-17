defmodule PartyGame.CanvasTest do
  alias PartyGame.Games.CanvasDraw.CanvasGame
  use ExUnit.Case, async: true

  describe "Canvas tests" do
    test "word/1 generates random word" do
      assert CanvasGame.word(1) |> Enum.at(0) != CanvasGame.word(1) |> Enum.at(0)
    end

    test "CanvasDrawGame.new/1 generates a new game" do
      game = CanvasGame.new(%{rounds: 4})
      [question1 | t] = game
      [question2 | _] = t
      assert question1.question != question2.question && length(game) == 4
    end
  end
end
