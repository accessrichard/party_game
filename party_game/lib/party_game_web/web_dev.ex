defmodule PartyGameWeb.WebDev do

  # Make a game room to develop pages with.
  def start() do
    PartyGame.Game.GameRoom.new()
      |> PartyGame.Lobby.add_player("rich1")
      |> PartyGame.Lobby.add_player("rich2")
      |> add_room_name()
      |> PartyGame.Server.start()
  end

  def get(code \\ "zzzz") do
    PartyGame.Server.get_game(code)
  end

  defp add_room_name(%PartyGame.Game.GameRoom{} = room) do
    %{room | room_name: "zzzz"}
  end

end
