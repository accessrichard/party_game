defmodule PartyGameWeb.GameController do
  require Logger

  use PartyGameWeb, :controller

  alias PartyGame.GameRoom
  alias PartyGame.Game.MultipleChoice
  alias PartyGame.Server
  alias PartyGame.Games.GameList

  action_fallback PartyGameWeb.FallbackController

  def create(conn, %{"player_name" => player_name}) do

    Logger.info  "Create game for player: #{player_name}"

    with %MultipleChoice{} = game <- GameRoom.add_player(MultipleChoice.new(), player_name) do
      game = GameRoom.gen_room_name(game)
      Server.start(%{game: game})

      conn
      |> put_status(:created)
      |> render(:game, game: game)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render(:error, error: reason)
    end
  end

  def validate(conn, game_params) do
    changeset = MultipleChoice.create_game_changeset(%MultipleChoice{}, game_params)

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

    Logger.info  "Player: #{Map.get(player, "name")} joined game room: #{room_name}"

    with {:ok, pid} <- Server.lookup(room_name),
         game = GenServer.call(pid, :game),
         %MultipleChoice{} = game <- GameRoom.add_player(game, player) do

      Server.update_game(room_name, %{game: game})

      conn
      |> put_status(:created)
      |> render(:game, game: game)
    else
      {:error, reason} ->
        conn
        |> put_status(:ok)
        |> render(:error, error: reason)
    end
  end

  def list(conn, _) do
    render(conn, :list, games: GameList.cached_game_list)
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
