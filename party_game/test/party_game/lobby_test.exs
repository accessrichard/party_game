defmodule PartyGame.LobbyTest do
  alias PartyGame.Game.{GameRoom, Player}
  alias PartyGame.Lobby
  alias PartyGame.Game.MultipleChoiceSettings
  alias PartyGame.Game.MultipleChoice

  use ExUnit.Case, async: true

  describe "Lobby tests" do
    test "gen_room_name/1 generates a room name" do
      room_name = Lobby.gen_room_name(%GameRoom{}).room_name
      assert room_name !== ""
    end

    test "add_player/2 adds a player" do
      game_room = Lobby.add_player(%GameRoom{}, %{"name" => "test"})
      assert Enum.at(game_room.players, 0).name == "test"
    end

    test "add_player!/2 adds a player" do
      game_room = Lobby.add_player(%GameRoom{}, "test")
      assert Enum.at(game_room.players, 0).name == "test"
    end

    test "update_settings/2 updates settings" do
      settings =
        MultipleChoiceSettings.apply_settings(%MultipleChoiceSettings{}, %{next_question_time: 15})

      game = %{GameRoom.new() | game: %MultipleChoice{}}
      game_room = Lobby.update_settings(game, settings)
      assert game_room.game.settings.next_question_time == 15
    end

    test "name_take/2 ensures unique name" do
      game_room = GameRoom.new()
      game_room = Lobby.add_player(game_room, "test")
      {:error, error} = Lobby.name_taken(game_room, "test")
      assert error.player_name != nil
    end

    test "name_take/2 ensures name can be added" do
      game_room = GameRoom.new()
      game_room = Lobby.add_player(game_room, "test")
      {:ok, name} = Lobby.name_taken(game_room, "unique")
      assert name == "unique"
    end

    test "player_exists/2 tests player exists" do
      game_room = GameRoom.new()
      game_room = Lobby.add_player(game_room, "test")
      assert Lobby.player_exists?(game_room, "test")
    end

    test "remove_player/2 removes player" do
      game_room = GameRoom.new()
      game_room = Lobby.add_player(game_room, "test")
      game_room = Lobby.remove_player(game_room, "test")
      assert !Lobby.player_exists?(game_room, "test")
    end

    test "update_room_owner/2 updates room owner" do
      game_room =
        GameRoom.new()
        |> Lobby.add_player("test")
        |> Lobby.remove_player("test")

      assert !Lobby.player_exists?(game_room, "test")
    end

    test "update_player/2 update a player" do
      game =
        Lobby.add_player(GameRoom.new(), "richard")
        |> Lobby.add_player("Sue")
        |> Lobby.update_player(%Player{name: "Sue", wins: 1})

      all_updated = Enum.filter(game.players, fn x -> x.wins == 1 end)
      [player | _] = all_updated
      assert length(all_updated) == 1 && player.name == "Sue"
    end
  end
end
