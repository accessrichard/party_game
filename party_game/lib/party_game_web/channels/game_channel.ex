defmodule PartyGameWeb.GameChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.Server
  alias PartyGame.ChannelWatcher
  alias PartyGame.GameRoom
  alias PartyGame.Game.Player
  alias PartyGame.Games.Games
  alias PartyGame.Game.Settings

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
    :ok = ChannelWatcher.monitor(self(), {__MODULE__, :leave, [socket.topic]})

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
  def handle_in("update_settings", payload, socket) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.update_settings(Map.get(payload, "settings", %{}))
      |> Server.update_game()

    broadcast_from(socket, "handle_update_settings", %{
      "settings" => game.settings
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("start_round", _, socket) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.start_round()
      |> Server.update_game()

    reply_with_questions(socket, game.questions, %{is_new?: false})
  end

  @impl true
  def handle_in("new_game", payload, socket) do
    client_form = Map.get(payload, "game")
    game_name = Map.get(client_form, "name")
    game_location = Map.get(client_form, "location")
    rounds = Map.get(payload, "rounds", 10)
    server_game = Server.get_game(game_code(socket.topic))

    game =
      if game_location == "client" do
        PartyGame.Game.Game.create_game(server_game, client_form)
      else
        server_game
      end

    questions =
      Games.generate_questions(%{
        name: game_name,
        rounds: rounds,
        location: game_location,
        game: game
      })

    game =
      game
      |> GameRoom.start_game()
      |> GameRoom.add_questions(questions, game_name)

    if game.settings.prompt_game_start do
      Server.update_game(game)

      broadcast(socket, "handle_new_game_created", %{})
      {:noreply, socket}
    else
      game
      |> GameRoom.start_round()
      |> Server.update_game()

      reply_with_questions(socket, game.questions, %{is_new?: true})
    end
  end

  @impl true
  def handle_in("next_question", _, socket) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.next_question()
      |> GameRoom.start_round()
      |> Server.update_game()

    question =
      if length(game.questions) >= 1 do
        [question | _] = game.questions
        question
      else
        %{question: "", answers: []}
      end

    broadcast(
      socket,
      "handle_next_question",
      %{
        data: %{
          rounds: game.rounds,
          answer: "",
          winner: "",
          isOver: game.is_over,
          question: question.question,
          answers: question.answers
        }
      }
    )

    {:noreply, socket}
  end

  @impl true
  def handle_in("answer_click", payload, socket) do
    game = Server.get_game(game_code(socket.topic))

    answer = Map.get(payload, "answer")

    case GameRoom.buzz(game, socket.assigns.name, answer) do
      {:win, game} ->
        broadcast(
          socket,
          "handle_correct_answer",
          %{
            data: %{
              rounds: game.rounds,
              answer: answer,
              winner: socket.assigns.name,
              isOver: game.is_over
            }
          }
        )

        Server.update_game(game)
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
    Server.get_game(game_code(socket.topic))
    |> GameRoom.remove_player(socket.assigns.name)
    |> Server.update_game()

    :ok
  end

  defp game_code(topic) do
    [_ | code] = String.split(topic, ":")
    [code] = code
    code
  end

  defp reply_with_questions(socket, [question | _], %{is_new?: isNew}) do
    resp = %{"data" => question, "isNew" => isNew}
    broadcast(socket, "handle_next_question", resp)
    {:noreply, socket}
  end

  def leave(topic) do
    players = Map.keys(Presence.list(topic))

    if players == [] do
      Server.stop(game_code(topic))
    else
      elect_new_game_owner(Server.lookup(game_code(topic)), players, topic)
    end
  end

  defp elect_new_game_owner({:error, _}, _, _), do: :ok

  defp elect_new_game_owner({:ok, _}, players, topic) do
    new_owner = List.first(players)
    game = Server.get_game(game_code(topic))
    game = GameRoom.update_room_owner(game, new_owner)
    Server.update_game(game)
    PartyGameWeb.Endpoint.broadcast!(topic, "handle_room_owner_change", %{room_owner: new_owner})
  end
end
