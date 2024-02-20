defmodule PartyGame.ServerTest do
  alias PartyGame.Server
  alias PartyGame.Lobby

  use ExUnit.Case

  describe "Game Server Tests" do
    test "start/1 starts a game" do
      game_room =
        Lobby.new()
        |> Lobby.gen_room_name()
        |> Lobby.add_player("richard")

      Server.start(game_room)
      game_room = Lobby.add_player(game_room, "Rick")

      Server.update_game(game_room.room_name, game_room)
      game2 = Server.get_game(game_room.room_name)

      assert game2.room_name == game_room.room_name && Enum.count(game_room.players) == 2
    end
  end
end
