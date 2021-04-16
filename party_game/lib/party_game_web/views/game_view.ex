defmodule PartyGameWeb.GameView do
  use PartyGameWeb, :view

  def render("error.json", %{error: reason}) do
    %{error: reason}
  end

  def render("game.json",  %{game: game}) do
    %{data: Map.from_struct(game)}
  end

  def render("games.json",  %{games: games}) do
    %{data: games}
  end

  def render("stop.json", room_name) do
    %{status: "stopped", room_name: room_name}
  end
end
