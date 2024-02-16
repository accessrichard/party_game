defmodule PartyGameWeb.CanvasDrawChannel do
  require Logger
  use PartyGameWeb, :channel

  alias PartyGame.Server

  @channel_name "canvas_draw:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        name = Map.get(payload, "name")
        socket = assign(socket, :name, name)
        send(self(), {:after_join})
        {:ok, socket}

      _ ->
        send(self(), {:after_join, :game_not_found})
        {:ok, socket}
    end
  end

  @impl true
  def handle_info({:after_join, :game_not_found}, socket) do
    broadcast(socket, "handle_game_server_idle_timeout", %{"reason" => "Game Not Found"})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_in(@channel_name <> _room_name, payload, socket) do
    broadcast(socket, "chat", payload)
    {:noreply, socket}
  end
end
