defmodule PartyGameWeb.HomeController do
  use PartyGameWeb, :controller

  alias PartyGame.Games.Games

  def index(conn, _params) do
    render(conn, "home.html", game_list: Games.cached_game_list)
  end
end
