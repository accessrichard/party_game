defmodule PartyGameWeb.FallbackController do
  use PartyGameWeb, :controller

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(PartyGameWeb.ErrorView)
    |> render(:"404")
  end
end
