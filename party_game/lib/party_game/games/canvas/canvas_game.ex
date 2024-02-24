defmodule PartyGame.Games.Canvas.CanvasGame do
  alias PartyGame.Game.Canvas
  alias PartyGame.Game.GameRoom

  @word_path "./lib/party_game/games/canvas"

  def new(game, _options \\ %{}) do
    Canvas.create_game(%Canvas{}, game)
  end

  def change_turn(%GameRoom{} = game_room) do
    index = Enum.find_index(game_room.players, &(game_room.game.turn == &1.name))
    index = if index == nil, do: 0, else: index + 1
    index = if index > length(game_room.players) - 1, do: 0, else: index
    turn = Enum.at(game_room.players, index)
    %{game_room | game: %{game_room.game | turn: turn.name }}
  end

  def chanage_word(%GameRoom{} = game_room) do
    %{game_room | game: %{game_room.game | word: Enum.at(word(1), 0) }}
  end


  def word(count) do
    json = File.read!(Path.join(@word_path, "drawings.json"))
    list = Jason.decode!(json)
    Enum.take_random(list, count)
  end
end
