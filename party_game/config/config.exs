 # This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

# Configures the endpoint
config :party_game, PartyGameWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "oTPnfkiRsbcHQI+O8w6neJ7CX1lZ0ZC9BcXne0Xqq41ZcVCAdFUT6Zrc3f4cW9tw",
  render_errors: [view: PartyGameWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: PartyGame.PubSub,
  live_view: [signing_salt: "gb3W3uv2"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
