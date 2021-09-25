defmodule PartyGameWeb.CreateController do
  use PartyGameWeb, :controller

  alias PartyGame.Game.Game

  action_fallback PartyGameWeb.FallbackController

  def validate(conn, game_params) do
    changeset = Game.create_game_changeset(%Game{}, game_params)

    case changeset.valid? do
      true ->
        conn
        |> put_status(:ok)
        |> render("success.json", %{isValid: true})

      false ->
        conn
        |> put_status(:ok)
        |> render("error.json", changeset: changeset)
    end
  end
end
