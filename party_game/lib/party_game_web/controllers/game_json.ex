defmodule PartyGameWeb.GameJSON do

  def error(%{error: reason}) do
    %{error: reason}
  end

  def game(%{game: game}) do
    %{
      data: %{
        name: game.name,
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

  def games(%{games: games}) do
    %{data: Enum.map(games, fn x ->
      %{
        category: x.category,
        location: x.location,
        name: x.name
      }
    end)}
  end

  def stop(room_name) do
    %{status: "stopped", room_name: room_name}
  end
end
