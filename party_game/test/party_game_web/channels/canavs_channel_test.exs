defmodule PartyGameWeb.CanvasChannelTest do
  use PartyGameWeb.ChannelCase

  alias PartyGame.Server
  alias PartyGame.Game.GameRoom

  setup do
    {:ok, _, socket} =
      PartyGameWeb.UserSocket
      |> socket("name", %{name: "test"})
      |> subscribe_and_join(PartyGameWeb.CanvasDrawChannel, "canvas:test")

    Server.start(%GameRoom{room_name: "test"})
    %{socket: socket}
  end

  test "start starts a game", %{socket: socket} do

    push(socket, "start", %{})
    assert_broadcast "start", %{"word" => _}
  end

end
