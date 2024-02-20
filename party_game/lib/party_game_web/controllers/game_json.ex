defmodule PartyGameWeb.GameJSON do
  alias PartyGame.EctoHelpers

  def error(%{error: reason}) do
    %{error: reason}
  end

  def error(%{changeset: changeset}) do
    errors = EctoHelpers.format_errors(changeset)
    %{errors: errors, isValid: false}
  end

  def success(%{isValid: isValid}) do
    %{isValid: isValid}
  end

  def game(%{game_room: game_room}) do
    %{
      data: %{
        name: game_room.game.name,
        is_over: game_room.is_over,
        players: game_room.players,
        questions: game_room.game.questions,
        room_name: game_room.room_name,
        room_owner: game_room.room_owner,
        round_started: game_room.game.round_started,
        rounds: game_room.game.rounds,
        started: game_room.started
      }
    }
  end

  def list(%{games: games}) do
    %{data: Enum.map(games, fn x ->
      %{
        category: x.category,
        location: x.location,
        name: x.name,
        url: x.url
      }
    end)}
  end

  def stop(room_name) do
    %{status: "stopped", room_name: room_name}
  end
end
