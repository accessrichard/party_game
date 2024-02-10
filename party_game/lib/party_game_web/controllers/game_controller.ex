defmodule PartyGameWeb.GameController do
  require Logger

  use PartyGameWeb, :controller

  alias PartyGame.GameRoom
  alias PartyGame.Game.Game
  alias PartyGame.Server

  action_fallback PartyGameWeb.FallbackController

  def create(conn, %{"player_name" => player_name}) do

    Logger.info  "Create game for player: #{player_name}"

    with %Game{} = game <- GameRoom.add_player(Game.new(), player_name) do
      game = GameRoom.gen_room_name(game)
      Server.start(game)

      conn
      |> put_status(:created)
      |> render("game.json", game: game)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render("error.json", error: reason)
    end
  end

  def join(conn, %{"player" => player, "room_name" => room_name}) do

    Logger.info  "Player: #{Map.get(player, "name")} joined game room: #{room_name}"

    with {:ok, pid} <- Server.lookup(room_name),
         game = GenServer.call(pid, :game),
         %Game{} = game <- GameRoom.add_player(game, player) do

      Server.update_game(room_name, game)

      conn
      |> put_status(:created)
      |> render("game.json", game: game)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render("error.json", error: reason)
    end
  end

  def list(conn, _) do
    render(conn, "games.json", games: PartyGame.Games.Games.list_non_blank())
  end

  def stop(conn, %{"room_name" => room_name}) do
    with :ok <- Server.stop(room_name) do
      conn
      |> put_status(:ok)
      |> render("stop.json", room_name)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render("error.json", error: reason)
    end
  end
end
