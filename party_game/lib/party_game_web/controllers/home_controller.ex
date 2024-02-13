defmodule PartyGameWeb.HomeController do
  use PartyGameWeb, :controller

  def index(conn, _params) do
    render(conn, "home.html", home: nil)
  end
end
