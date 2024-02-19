defmodule PartyGame.Channels.Authorized do
  alias PartyGame.Game.MultipleChoice
  alias PartyGame.GameRoom
  alias PartyGame.Server

  def authorized?(%MultipleChoice{} = game, name), do: GameRoom.player_exists?(game, name)

  def authorized?(%{"name" => name, "room_name" => room_name}) do
    game = Server.get_game(room_name)
    GameRoom.player_exists?(game, name)
  end

  def authorized?(_), do: false
end
