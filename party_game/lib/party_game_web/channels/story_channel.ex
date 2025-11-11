defmodule PartyGameWeb.StoryChannel do
  require Logger

  use PartyGameWeb, :channel
  use PartyGameWeb.GameChannel

  alias PartyGame.Games.Story.StoryGame
  alias PartyGame.Game.{Story, StoryToken}
  alias PartyGame.{Server, Lobby}

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
  def handle_info({:after_join}, socket) do
    Logger.debug("After Join #{socket.topic} for: #{socket.assigns.name}")
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_game", payload, socket) do
    Logger.debug("New Story Game #{socket.topic} from #{socket.assigns.name}")
    story = StoryGame.new(%Story{}, payload)
    story = if Map.get(payload, "tokens", []) == [], do: StoryGame.add_story(story), else: story

    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.set_game(story)
      |> StoryGame.advance()
      |> Server.update_game()

    broadcast(socket, "handle_new_game", %{
      tokens: game_room.game.tokens,
      name: game_room.game.name,
      turn: game_room.game.turn,
      token_index: game_room.game.token_index,
      type: game_room.game.type
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("end_game", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.update_player_location(socket.assigns.name, "lobby")
      |> Server.update_game()

    broadcast_from(socket, "handle_quit", %{
      "returnToLobby" => socket.assigns.name == game_room.room_owner
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("update_token", updated_token, socket) do
    game_room = Server.get_game(game_code(socket.topic))
    updated_token = Map.put_new(updated_token, "updated_by", socket.assigns.name)

    case updated?(game_room.game, updated_token) do
      true ->
        game_room =
          game_room
          |> StoryGame.update_token(StoryToken.create_token(updated_token))
          |> StoryGame.advance()
          |> Server.update_game()

        broadcast(socket, "handle_update_token", %{
          token: updated_token,
          turn: game_room.game.turn,
          token_index: game_room.game.token_index
        })

        {:noreply, socket}

      false ->
        {:noreply, socket}
    end
  end

  @impl true
  def handle_in("submit_form", form, socket) do
    game_room = Server.get_game(game_code(socket.topic))

    broadcast(socket, "handle_submit_form", %{
      tokens: form["tokens"],
      name: game_room.game.name,
      turn: game_room.game.turn,
      type: game_room.game.type
    })

    {:noreply, socket}
  end

  defp updated?(%Story{} = story, new_token) do
    token = Enum.find(story.tokens, fn x -> x.id == new_token["id"] end)
    token.value !== new_token["value"]
  end
end
