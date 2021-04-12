defmodule PartyGame.StatesTest do
  alias PartyGame.Games.States

  use ExUnit.Case, async: true

  describe "State Capitals Game" do
    test "new/1 gets correct question count" do
      game = States.new(4)
      assert Enum.count(game) == 4
    end

    test "new/1 gets new questions" do
      [state | _] = States.new(1)
      [state2 | _] = States.new(1)
      refute state.answers == state2.answers
    end
  end
end
