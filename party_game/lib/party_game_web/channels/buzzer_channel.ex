defmodule PartyGameWeb.BuzzerChannel do
  use PartyGameWeb, :channel

  alias PartyGame.Server
  alias PartyGame.Game

  @impl true
  def join("buzzer:" <> _room_name, payload, socket) do
    socket = assign(socket, :name, Map.get(payload, "name"))
    send(self(), {:after_join})
    {:ok, socket}
  end

  @impl true
  def handle_info({:after_join}, socket) do
    broadcast_from(socket, "join", %{"name" => socket.assigns.name})
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
    |> Game.remove_player(socket.assigns.name)
    |> Server.update_game()

    :ok
  end

  defp game_code(topic) do
    [_ | code] = String.split(topic, ":")
    [code] = code
    code
  end

  defp action("start", socket, payload), do: start(socket, payload)
  defp action("next", socket, payload), do: next(socket, payload)
  defp action("stop", socket, payload), do: broadcast_action(socket, stop(payload), "startstop")

  defp action("countdown", socket, payload),
    do: broadcast_action(socket, countdown(payload), "countdown")

  defp action("buzz", socket, payload), do: buzz(socket, payload)
  defp action("join", socket, _), do: {:reply, {:ok, "Not Implemented"}, socket}
  defp action("quit", socket, _), do: {:reply, {:ok, "Not Implemented"}, socket}
  defp action(_, socket, _), do: {:reply, {:ok, "nothing to see here"}, socket}

  defp start(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
      |> Game.start_round()
      |> Server.update_game()

    [question | _] = game.questions
    payload = start(payload)
    broadcast(socket, "startstop", assigns_payload(socket, payload, question))
    {:noreply, socket}
  end

  defp next(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
      |> Game.next_question()
      |> Game.start_round()
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

    case Game.buzz(game, socket.assigns.name, answer) do
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
