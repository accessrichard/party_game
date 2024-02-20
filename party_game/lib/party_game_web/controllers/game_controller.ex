defmodule PartyGameWeb.GameController do
  require Logger

  use PartyGameWeb, :controller

  alias PartyGame.Server
  alias PartyGame.Games.GameList
  alias PartyGame.Game.GameRoom
  alias PartyGame.Lobby

  action_fallback PartyGameWeb.FallbackController

  def create(conn, %{"player_name" => player_name}) do
    Logger.info("Create game for player: #{player_name}")

    with %GameRoom{} = game_room <- Lobby.add_player(GameRoom.new(), player_name) do
      game_room = Lobby.gen_room_name(game_room)
      Server.start(game_room)

      conn
      |> put_status(:created)
      |> render(:game, game_room: game_room)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render(:error, error: reason)
    end
  end

  def validate(conn, game_params) do
    changeset = GameRoom.create_game_changeset(%GameRoom{}, game_params)

    case changeset.valid? do
      true ->
        conn
        |> put_status(:ok)
        |> render(:success, %{isValid: true})

      false ->
        conn
        |> put_status(:ok)
        |> render(:error, changeset: changeset)
    end
  end

  def join(conn, %{"player" => player, "room_name" => room_name}) do
    Logger.info("Player: #{Map.get(player, "name")} joined game room: #{room_name}")

    with {:ok, pid} <- Server.lookup(room_name),
         game_room = GenServer.call(pid, :game),
         %GameRoom{} = game_room <- Lobby.add_player(game_room, player) do
      Server.update_game(room_name, game_room)

      conn
      |> put_status(:created)
      |> render(:game, game_room: game_room)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render(:error, error: reason)
    end
  end

  def list(conn, _) do
    render(conn, :list, games: GameList.non_black_cached_list())
  end

  def stop(conn, %{"room_name" => room_name}) do
    with :ok <- Server.stop(room_name) do
      conn
      |> put_status(:ok)
      |> render(:stop, room_name)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render(:error, error: reason)
    end
  end
end
