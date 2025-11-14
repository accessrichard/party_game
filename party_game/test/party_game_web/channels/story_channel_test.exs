defmodule PartyGameWeb.StoryChannelTest do
  use PartyGameWeb.ChannelCase

  alias PartyGame.Server
  alias PartyGame.Lobby

  setup do
    Lobby.new()
    |> Map.put(:room_name, "test2")
    |> Lobby.add_player("tester")
    |> Server.start()

    {:ok, _, socket} =
      PartyGameWeb.UserSocket
      |> socket("story", %{})
      |> subscribe_and_join(PartyGameWeb.StoryChannel, "story:test2", %{"name" => "tester"})

    %{socket: socket}
  end

  test "new_game broadcasts the new story", %{socket: socket} do
    push(socket, "new_game", %{
      "text" => "This is a [adjective] story.",
      "settings" => %{
        "roundTime" => 30
      }
    })

    assert_broadcast "handle_new_game", %{
      name: nil,
      token_index: 998,
      tokens: [
        %{
          id: 0,
          type: "text",
          placeholder: "",
          value: "This is a ",
          updated_by: nil,
          errors: []
        },
        %{
          id: 1,
          type: "input",
          placeholder: "adjective",
          value: "",
          updated_by: nil,
          errors: []
        },
        %{
          id: 2,
          type: "text",
          placeholder: "",
          value: " story.",
          updated_by: nil,
          errors: []
        }
      ],
      turn: "tester",
      type: "alternate_sentence",
      settings: %{round_time: 30}
    }
  end

  test "update_token broadcasts the updated token", %{socket: socket} do
    push(socket, "new_game", %{
      "text" => "A [noun] story."
    })

    assert_broadcast "handle_new_game", _

    push(socket, "update_token", %{
      "id" => 1,
      "value" => "great"
    })

    assert_broadcast "handle_update_token", %{
      token: %{"id" => 1, "updated_by" => "tester", "value" => "great"},
      token_index: 998,
      turn: "tester"
    }
  end
end
