defmodule PartyGameWeb.BuzzerChannel do
  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.Server
  alias PartyGame.GameRoom
  alias PartyGame.Game.Player
  alias PartyGame.Games.Games

  @impl true
  def join("buzzer:" <> _room_name, payload, socket) do
    socket = assign(socket, :name, Map.get(payload, "name"))
    send(self(), {:after_join})
    {:ok, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: DateTime.utc_now() |> DateTime.to_unix(:second)
      })

    push(socket, "presence_state", Presence.list(socket))
    player = Player.add_player(socket.assigns.name)

    broadcast_from(socket, "join", player)
    {:noreply, socket}
  end

  @impl true
  def handle_in("buzzer:" <> _room_name, %{"action" => action} = payload, socket) do
    action(action, socket, payload)
  end

  @impl true
  def handle_in("buzzer:" <> _room_name, _, socket) do
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
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

  defp action("start", socket, payload), do: start(socket, payload)
  defp action("new", socket, payload), do: new(socket, payload)
  defp action("next", socket, payload), do: next(socket, payload)
  defp action("stop", socket, payload), do: broadcast_action(socket, stop(payload), "startstop")
  defp action("update_player", socket, payload), do: update_player(socket, payload)

  defp action("countdown", socket, payload),
    do: broadcast_action(socket, countdown(payload), "countdown")

  defp action("buzz", socket, payload), do: buzz(socket, payload)
  defp action("join", socket, _), do: {:reply, {:ok, "Not Implemented"}, socket}
  defp action("quit", socket, _), do: {:reply, {:ok, "Not Implemented"}, socket}
  defp action(_, socket, _), do: {:reply, {:ok, "nothing to see here"}, socket}

  defp new(socket, payload) do
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

    # Shuffle questions for client games
    questions =
      if game_location == "client" do
        Games.shuffle_questions(questions)
        |> Games.shuffle_question_answers()
      else
        questions
      end

    game =
      game
      |> GameRoom.start_round()
      |> GameRoom.add_questions(questions, game_name)
      |> Server.update_game()

    reply_with_questions(socket, game, payload)
  end

  defp start(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.start_round()
      |> Server.update_game()

    reply_with_questions(socket, game, payload)
  end

  defp reply_with_questions(socket, game, payload) do
    [question | _] = game.questions
    payload = start(payload)
    broadcast(socket, "startstop", assigns_payload(socket, payload, question))
    {:noreply, socket}
  end

  defp update_player(socket, payload) do
    payload_player = Map.get(payload, "player")

    game = Server.get_game(game_code(socket.topic))
    player = GameRoom.get_player(game, payload_player)
    changeset = Player.changeset(player, payload_player)

    case map_size(changeset.changes) == 0 do
      true ->
        updated_player = Ecto.Changeset.apply_changes(changeset)

        game
        |> GameRoom.update_player(updated_player)
        |> Server.update_game()

        broadcast_from(socket, "update_player", %{
          "name" => socket.assigns.name,
          "player" => updated_player
        })

      false ->
        {:noreply, socket}
    end
  end

  defp next(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.next_question()
      |> GameRoom.start_round()
      |> Server.update_game()

    payload = start(payload)

    question =
      if length(game.questions) >= 1 do
        [question | _] = game.questions
        question
      else
        %{question: "", answers: []}
      end

    broadcast(
      socket,
      "startstop",
      assigns_payload(
        socket,
        payload,
        %{
          rounds: game.rounds,
          answer: "",
          winner: "",
          isOver: game.is_over,
          question: question.question,
          answers: question.answers
        }
      )
    )

    {:noreply, socket}
  end

  defp buzz(socket, payload) do
    game = Server.get_game(game_code(socket.topic))

    answer = Map.get(payload, "answer")

    case GameRoom.buzz(game, socket.assigns.name, answer) do
      {:win, game} ->
        broadcast(
          socket,
          "buzz",
          assigns_payload(socket, payload, %{
            rounds: game.rounds,
            answer: answer,
            winner: socket.assigns.name,
            isOver: game.is_over
          })
        )

        Server.update_game(game)
        {:noreply, socket}

      _ ->
        {:reply, :wrong, socket}
    end
  end

  defp broadcast_action(socket, payload, action) do
    broadcast(socket, action, assigns_payload(socket, payload))
    {:noreply, socket}
  end

  defp start(payload) do
    Map.put(payload, "action", "start")
  end

  defp stop(payload) do
    Map.put(payload, "action", "stop")
  end

  defp countdown(payload) do
    Map.put(payload, "action", "countdown")
  end

  defp assigns_payload(socket, payload, data \\ nil) do
    %{
      event: %{timestamp: DateTime.utc_now(), action: Map.get(payload, "action")},
      player: %{name: socket.assigns.name},
      data: data
    }
  end
end
