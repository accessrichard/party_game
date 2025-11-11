defmodule PartyGameWeb.GameChannel do
  @moduledoc """
  Provides shared functionality for game channels.
  """


  defmacro __using__(_opts) do
    quote do

      import PartyGameWeb.GameUtils

      @impl true
      def handle_info({:after_join, :game_not_found}, socket) do
        lobby = PartyGameWeb.LobbyChannel.channel_name()

        PartyGameWeb.Endpoint.broadcast(
          "#{lobby}#{game_code(socket.topic)}",
          "handle_game_server_error",
          %{
            "reason" => "Game Not Found"
          }
        )

        {:noreply, socket}
      end

    end
  end
end
