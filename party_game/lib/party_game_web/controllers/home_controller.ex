defmodule PartyGameWeb.HomeController do
  use PartyGameWeb, :controller

  alias PartyGame.Games.GameList

  def index(conn, _params) do
    render(conn, "home.html", game_list: GameList.cached_game_list)
  end
end
