defmodule PartyGameWeb.Router do
  use PartyGameWeb, :router
  use Plug.ErrorHandler
  require Logger

  alias PartyGameWeb.{
    GameController,
    JavaScriptSpaController,
    HomeController
  }

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :put_root_layout, html: {PartyGameWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api" do
    pipe_through :api

    post "/game", GameController, :create
    post "/game/validate", GameController, :validate
    post "/game/join", GameController, :join
    post "/game/stop", GameController, :stop
    get "/game/list", GameController, :list
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: PartyGameWeb.Telemetry
    end
  end

  scope "/" do
    # Use the default browser stack
    pipe_through :browser

    get "/", HomeController, :index

    # This route declaration MUST be below everything else! Else, it will
    # override the rest of the routes, even the `/api` routes we've set above.
    get "/*path", JavaScriptSpaController, :index
  end

  def handle_errors(conn, %{kind: kind, reason: reason, stack: stack} = _) do
    Logger.error("Kind: #{inspect(kind)}, Reason: #{inspect(reason)}, Stack: #{inspect(stack)}")
    conn
  end

end
