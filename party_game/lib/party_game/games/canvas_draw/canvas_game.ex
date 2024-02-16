defmodule PartyGame.Games.CanvasDraw.CanvasGame do
  @word_path "./lib/party_game/games/canvas_draw"

  def word() do
    json = File.read!(Path.join(@word_path, "drawings.json"))
    list = Jason.decode!(json)
    Enum.take_random(list, 1) |> Enum.at(0)
  end
end
