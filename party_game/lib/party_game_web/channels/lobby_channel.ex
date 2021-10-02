defmodule PartyGameWeb.LobbyChannel do
  use PartyGameWeb, :channel

  alias PartyGame.Server

  @impl true
  def join("lobby:" <> room_name, payload, socket) do
    socket = assign(socket, :game,  Server.get_game(room_name))
    broadcast_player_join(Map.get(payload, "name"), socket)
  end

  defp broadcast_player_join(name, socket) do
    send(self(), {:after_join, name})
    {:ok, socket}
  end

  @impl true
  def handle_in("lobby:" <> _room_name, %{"action" => action} = payload, socket) do
    action(action, socket, payload)
  end

  defp action("start", socket, payload), do: broadcast_start(socket, payload)
  defp action(_, socket, _), do: {:reply, {:ok, "nothing to see here"}, socket}

  defp broadcast_start(socket, _) do
    broadcast(socket, "start", %{})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join, name}, socket) do
    broadcast_from(socket, "join", %{"player" => name})
    {:noreply, socket}
  end
end
