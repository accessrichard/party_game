defmodule PartyGame.Channels.Authorized do
  alias PartyGame.Game
  alias PartyGame.Server

  def authorized?(%Game{} = game, name), do: Game.player_exists?(game, name)

  def authorized?(%{"name" => name, "room_name" => room_name}) do
    game = Server.get_game(room_name)
    Game.player_exists?(game, name)
  end

  def authorized?(_), do: false
end
