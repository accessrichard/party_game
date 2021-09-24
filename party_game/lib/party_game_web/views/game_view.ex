defmodule PartyGameWeb.GameView do
  use PartyGameWeb, :view

  def render("error.json", %{error: reason}) do
    %{error: reason}
  end

  def render("game.json", %{game: game}) do
    %{
      data: %{
        game: game.name,
        is_over: game.is_over,
        players: game.players,
        questions: game.questions,
        room_name: game.room_name,
        room_owner: game.room_owner,
        round_started: game.round_started,
        rounds: game.rounds,
        started: game.started
      }
    }
  end

  def render("games.json", %{games: games}) do
    %{data: games}
  end

  def render("stop.json", room_name) do
    %{status: "stopped", room_name: room_name}
  end
end
