defmodule PartyGame.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      PartyGameWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: PartyGame.PubSub},
      # Start the Endpoint (http/https)
      PartyGameWeb.Endpoint,
      PartyGameWeb.Presence,
      # Start a worker by calling: PartyGame.Worker.start_link(arg)
      # {PartyGame.Worker, arg}
      {Registry, keys: :unique, name: PartyGame.Game.Registry},
      {DynamicSupervisor, name: PartyGame.Game.Supervisor, strategy: :one_for_one}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PartyGame.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    PartyGameWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
