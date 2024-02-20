defmodule PartyGame.Channels.Authorized do
  alias PartyGame.Lobby
  alias PartyGame.Server
  alias PartyGame.Game.GameRoom

  def authorized?(%GameRoom{} = game, name), do: Lobby.player_exists?(game, name)

  def authorized?(%{"name" => name, "room_name" => room_name}) do
    game = Server.get_game(room_name)
    Lobby.player_exists?(game, name)
  end

  def authorized?(_), do: false
end
