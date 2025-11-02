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

  def observe() do
    Mix.ensure_application!(:wx)
    Mix.ensure_application!(:runtime_tools)
    Mix.ensure_application!(:observer)
    #:observer.start()
  end

  def count_children() do
    DynamicSupervisor.count_children(PartyGame.Game.Supervisor)
  end



end
