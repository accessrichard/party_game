defmodule PartyGame.ServerTest do
  alias PartyGame.Server
  alias PartyGame.Game.Game
  alias PartyGame.GameRoom

  use ExUnit.Case

  describe "Game Server Tests" do
    test "start/1 starts a game" do
      game =
        Game.new()
        |> GameRoom.gen_room_name()
        |> GameRoom.add_player("richard")

      Server.start(%{game: game})
      game = GameRoom.add_player(game, "Rick")

      Server.update_game(game.room_name, %{game: game})
      game2 = Server.get_game(game.room_name)

      assert game2.room_name == game.room_name && Enum.count(game.players) == 2
    end
  end
end
