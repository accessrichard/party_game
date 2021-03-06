defmodule PartyGameWeb.GameController do
  use PartyGameWeb, :controller

  alias PartyGame.Game
  alias PartyGame.Server

  action_fallback PartyGameWeb.FallbackController

  def create(conn, %{"player_name" => player_name}) do
    with %Game{} = game <- Game.add_player(Game.new(), player_name) do
      game = Game.gen_room_name(game)

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

  def join(conn, %{"player_name" => player_name, "room_name" => room_name}) do
    with {:ok, pid} <- Server.lookup(room_name),
         game = GenServer.call(pid, :game),
         %Game{} = game <- Game.add_player(game, player_name) do
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
    render(conn, "games.json", games: PartyGame.Games.Games.keys)
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
