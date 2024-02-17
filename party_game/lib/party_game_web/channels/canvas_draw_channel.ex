defmodule PartyGameWeb.CanvasDrawChannel do
  require Logger
  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.Server
  alias PartyGame.ChannelWatcher
  alias PartyGame.Game.Player
  alias PartyGame.Games.CanvasDraw.CanvasGame

  @channel_name "canvas:J"

  @impl true
  def join(@channel_name, payload, socket) do
    room_name = "J"
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
    #:ok =
    #  ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})

    broadcast(socket, "handle_game_server_idle_timeout", %{"reason" => "Game Not Found"})

    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
#    :ok =
#      ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})

#    {:ok, _} =
#     Presence.track(socket, socket.assigns.name, %{
#        online_at: DateTime.utc_now() |> DateTime.to_unix(:second),
#        typing: false
#      })

 #   push(socket, "presence_state", Presence.list(socket))
 #   player = Player.add_player(socket.assigns.name)

 #   broadcast_from(socket, "handle_join", player)
    {:noreply, socket}
  end

  @impl true
  def handle_in("commands", payload, socket) do
     broadcast_from(socket, "commands",  payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("resize", payload, socket) do
     broadcast_from(socket, "resize",  payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("word", _, socket) do
     broadcast(socket, "word",  %{"word" => CanvasGame.word(1) |> Enum.at(0)})
    {:noreply, socket}
  end

end
