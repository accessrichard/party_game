defmodule PartyGameWeb.CanvasController do
  use PartyGameWeb, :controller

  def index(conn, _params) do
    conn
    |> put_root_layout(html: :canvas)
    |> render("canvas.html", index: nil)
  end
end
