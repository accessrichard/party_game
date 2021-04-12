defmodule PartyGame.ServerTest do
  alias PartyGame.Server
  alias PartyGame.Game

  use ExUnit.Case

  describe "Game Server Tests" do
    test "start/1 starts a game" do
      game =
        Game.new()
        |> Game.gen_room_name()
        |> Game.add_player("richard")

      Server.start(game)
      game = Game.add_player(game, "Rick")

      Server.update_game(game.room_name, game)
      game2 = Server.get_game(game.room_name)

      assert game2.room_name == game.room_name && Enum.count(game.players) == 2
    end
  end
end
