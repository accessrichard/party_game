defmodule PartyGameWeb.StoryChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGame.Game.Story
  alias PartyGame.{Server, Lobby}
  import PartyGameWeb.GameUtils

  @channel_name "story:"

  def channel_name, do: @channel_name

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.debug("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

    case Server.lookup(room_name) do
      {:ok, _} ->
        name = Map.get(payload, "name")
        socket = assign(socket, :game, Server.get_game(room_name))
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
    Logger.debug("After Join Game not found:   #{socket.topic} for: #{socket.assigns.name}")
    broadcast(socket, "handle_game_server_error", %{"reason" => "Game No Longer Available"})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    Logger.debug("After Join #{socket.topic} for: #{socket.assigns.name}")
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_game", _payload, socket) do
    story = Story.create_story(%Story{}, %{})

    game_room =
       Server.get_game(game_code(socket.topic))
        |> Lobby.set_game(story)
        |> Server.update_game()


    broadcast(socket, "handle_new_game", %{story: game_room.game})
    {:noreply, socket}
  end

end
