defmodule PartyGameWeb.ChatChannel do
  use PartyGameWeb, :channel

  alias PartyGame.Server
  alias PartyGame.Channels.Authorized

  @impl true
  def join("chat:" <> room_name, payload, socket) do
    player_name = Map.get(payload, "playerName")
    IO.inspect room_name
    IO.inspect(player_name)

    game = Server.get_game(room_name)
    IO.inspect(game)

    case Authorized.authorized?(game, player_name) do
      true -> {:ok, socket}
      false -> {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("chat:" <> _room_name, payload, socket) do
    broadcast(socket, "chat", payload)
    {:noreply, socket}
  end
end
