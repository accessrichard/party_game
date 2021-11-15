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

  defp action("update_settings", socket, payload), do: update_settings(socket, payload)

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

    game =
      game
      |> GameRoom.start_game()
      |> GameRoom.start_round()
      |> GameRoom.add_questions(questions, game_name)
      |> Server.update_game()

    reply_with_questions(socket, game, payload)
  end

  defp start(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
      |> GameRoom.start_game()
      |> GameRoom.start_round()
      |> Server.update_game()

    reply_with_questions(socket, game, payload)
  end

  defp reply_with_questions(socket, game, payload) do
    [question | _] = game.questions
    payload = start(payload)
    broadcast(socket, "next_question", assigns_payload(socket, payload, question))
    {:noreply, socket}
  end

  defp update_settings(socket, payload) do
    game = Server.get_game(game_code(socket.topic))
    game = GameRoom.update_settings(game, Map.get(payload, "settings", %{}))
    Server.update_game(game)

    broadcast_from(socket, "update_settings", %{
      "name" => socket.assigns.name,
      "settings" => game.settings
    })
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
      "next_question",
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

  defp start(payload) do
    Map.put(payload, "action", "start")
  end

  defp assigns_payload(socket, payload, data) do
    %{
      event: %{timestamp: DateTime.utc_now(), action: Map.get(payload, "action")},
      player: %{name: socket.assigns.name},
      data: data
    }
  end
end
