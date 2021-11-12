defmodule PartyGameWeb.PageController do
  use PartyGameWeb, :controller

  def index(conn, _params) do
    file = File.read!("priv/static/index.html")
    html(conn, file)
  end

end
