defmodule PartyGameWeb.MultipleChoiceChannelTest do
  use PartyGameWeb.ChannelCase

  alias PartyGame.Server
  alias PartyGame.Game.GameRoom

  setup do
    {:ok, _, socket} =
      PartyGameWeb.UserSocket
      |> socket("name", %{name: "test"})
      |> subscribe_and_join(PartyGameWeb.MultipleChoiceChannel, "game:test")

    Server.start(%GameRoom{room_name: "test"})
    %{socket: socket}
  end

  test "new_game with game prompt broadcasts game created", %{socket: socket} do

    push(socket, "new_game", %{
      "game" => %{
        "category" => "Math",
        "location" => "server",
        "name" => "Subtraction",
        "url" => nil
      },
      "name" => "f",
      "rounds" => 10,
      "settings" => %{
        "next_question_time" => 1,
        "prompt_game_start" => true,
        "question_time" => 10,
        "rounds" => 10,
        "wrong_answer_timeout" => 1
      }
    })

    assert_broadcast "handle_new_game_created", %{"settings" => %PartyGame.Game.MultipleChoiceSettings{
      next_question_time: 1,
      prompt_game_start: true,
      question_time: 10,
      rounds: 10,
      wrong_answer_timeout: 1
    }}
  end

  test "new_game without game prompt starts game", %{socket: socket} do

    push(socket, "new_game", %{
      "game" => %{
        "category" => "Math",
        "location" => "server",
        "name" => "Subtraction",
        "url" => nil
      },
      "name" => "f",
      "rounds" => 10,
      "settings" => %{
        "next_question_time" => 1,
        "prompt_game_start" => false,
        "question_time" => 10,
        "rounds" => 10,
        "wrong_answer_timeout" => 1
      }
    })

    assert_broadcast "handle_next_question", %{"daata" => _}
  end
end
