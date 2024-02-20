defmodule PartyGameWeb.MultipleChoiceChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.{Server, Lobby}
  alias PartyGame.ChannelWatcher
  alias PartyGame.MultipleChoiceGame
  alias PartyGame.Game.Player
  alias PartyGame.Game.GameRoom
  alias PartyGame.Games.GameList
  alias PartyGame.Game.MultipleChoice

  @channel_name "game:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

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
    broadcast(socket, "handle_game_server_idle_timeout", %{"reason" => "Game Not Found"})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    :ok =
      ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic, socket.assigns.name]})

    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: DateTime.utc_now() |> DateTime.to_unix(:second),
        typing: false
      })

    push(socket, "presence_state", Presence.list(socket))
    player = Player.add_player(socket.assigns.name)

    broadcast_from(socket, "handle_join", player)
    {:noreply, socket}
  end

  @impl true
  def handle_in("start_round", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> MultipleChoiceGame.start_round()

    Server.update_game(game_room)

    reply_with_questions(socket, %{is_new?: false, game_room: game_room})
  end

  @impl true
  def handle_in("new_game", payload, socket) do
    client_form = Map.get(payload, "game")
    game_name = Map.get(client_form, "name")
    game_location = Map.get(client_form, "location")
    rounds = Map.get(payload, "rounds", 10)
    server_game = Server.get_game(game_code(socket.topic))

    game_room =
      if game_location == "client" do
        multiple_choice = MultipleChoice.create_game(MultipleChoice.new, client_form)
        GameRoom.create_game(server_game, %{game: multiple_choice})
      else
        server_game
      end

    questions =
      MultipleChoiceGame.generate_questions(
        %{
          name: game_name,
          rounds: rounds,
          location: game_location,
          game_room: game_room
        },
        GameList.cached_game_list()
      )

    game_room =
      game_room
      |> Lobby.start_game()
      |> MultipleChoiceGame.new()
      |> MultipleChoiceGame.add_questions(questions, game_name)

    game_room =
      if Map.has_key?(payload, "settings") do
        MultipleChoiceGame.update_settings(game_room, Map.get(payload, "settings"))
      else
        game_room
      end

    if game_room.game.settings.prompt_game_start do
      Server.update_game(game_room)
      broadcast(socket, "handle_new_game_created", %{"settings" => game_room.game.settings})
      {:noreply, socket}
    else
      game_room = MultipleChoiceGame.start_round(game_room)
      Server.update_game(game_room)
      reply_with_questions(socket, %{is_new?: true, game_room: game_room})
    end
  end

  @impl true
  def handle_in("next_question", _, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> MultipleChoiceGame.next_question()
      |> MultipleChoiceGame.start_round()

    Server.update_game(game_room)

    question = next_question(game_room)

    broadcast(
      socket,
      "handle_next_question",
      %{
        data: %{
          isOver: game_room.is_over,
          question: question.question,
          answers: question.answers,
          id: question.id
        }
      }
    )

    {:noreply, socket}
  end

  @impl true
  def handle_in("answer_click", payload, socket) do
    game_room = Server.get_game(game_code(socket.topic))
    answer = Map.get(payload, "answer")
    guid = Map.get(payload, "id")

    case MultipleChoiceGame.buzz(game_room, socket.assigns.name, answer, guid) do
      {:win, game_room} ->
        broadcast(
          socket,
          "handle_correct_answer",
          %{
            data: %{
              rounds: if(game_room.is_over, do: game_room.game.rounds, else: []),
              answer: answer,
              winner: socket.assigns.name,
              isOver: game_room.is_over
            }
          }
        )

        Server.update_game(game_room)
        {:noreply, socket}

      {:noreply, _} ->
        {:noreply, socket}

      _ ->
        push(socket, "handle_wrong_answer", %{isCorrect: false})
        {:noreply, socket}
    end
  end

  @impl true
  def handle_in("user:typing", payload, socket) do
    metas =
      Presence.get_by_key(socket.topic, socket.assigns.name)[:metas]
      |> List.first()
      |> Map.merge(%{typing: Map.get(payload, "typing")})

    {:ok, _} = Presence.update(socket, socket.assigns.name, metas)

    {:noreply, socket}
  end

  @impl true
  def handle_in("ping", _, socket) do
    Server.ping(game_code(socket.topic))
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    remove_player(Server.lookup(game_code(socket.topic)), socket)
  end

  defp remove_player({:error, _}, _), do: :ok

  defp remove_player({:ok, _}, socket) do
    game_room =
      Server.get_game(game_code(socket.topic))
      |> Lobby.remove_player(socket.assigns.name)

    Server.update_game(game_room)

    :ok
  end

  defp game_code(topic) do
    [_ | code] = String.split(topic, ":")
    [code] = code
    code
  end

  defp reply_with_questions(socket, %{is_new?: isNew, game_room: game_room}) do
    [question | _] = game_room.game.questions
    resp = %{"data" => question, "isNew" => isNew}

    resp =
      if isNew do
        Map.put(resp, "settings", game_room.game.settings)
      else
        resp
      end

    broadcast(socket, "handle_next_question", resp)
    {:noreply, socket}
  end

  def leave(topic, name) do
    players = Map.keys(Presence.list("lobby:" <> game_code(topic)))

    if players == [] do
      Server.stop(game_code(topic))
    else
      player_leave(Server.lookup(game_code(topic)), name, players, topic)
    end
  end

  defp player_leave({:error, _}, _, _, _), do: :ok

  defp player_leave({:ok, _}, name, players, topic) do
    game_room = Server.get_game(game_code(topic))
    game_room = Lobby.remove_player(game_room, name)

    game_room =
      if name == game_room.room_owner do
        elect_new_game_owner(players, topic, game_room)
      else
        game_room
      end

    Server.update_game(game_room)
  end

  defp elect_new_game_owner(players, topic, game_room) do
    new_owner = List.first(players)
    game_room = Lobby.update_room_owner(game_room, new_owner)
    PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{room_owner: new_owner})
    game_room
  end

  defp next_question(%GameRoom{} = game_room) when game_room.game.questions == [] do
    %{question: "", answers: [], id: Ecto.UUID.autogenerate()}
  end

  defp next_question(%GameRoom{} = game_room) do
    [question | _] = game_room.game.questions
    question
  end
end
