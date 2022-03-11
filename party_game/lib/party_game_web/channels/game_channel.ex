defmodule PartyGameWeb.GameChannel do
  require Logger

  use PartyGameWeb, :channel

  alias PartyGameWeb.Presence
  alias PartyGame.Server
  alias PartyGame.GameRoom
  alias PartyGame.Game.Player
  alias PartyGame.Games.Games
  alias PartyGame.Game.Settings

  @channel_name "game:"

  @impl true
  def join(@channel_name <> room_name, payload, socket) do
    Logger.info "Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}"

    name = Map.get(payload, "name")

    socket = assign(socket, :game,  Server.get_game(room_name))

    socket = assign(socket, :name, name)

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
  def handle_in(@channel_name <> room_name, %{"action" => action} = payload, socket) do
    Logger.info "handle_in #{@channel_name}#{room_name} for action: #{action}"
    action(action, socket, payload)
  end

  @impl true
  def handle_in(@channel_name <> _room_name, _, socket) do
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

  defp action("start", socket, payload), do: broadcast_start(socket, payload)
  defp action("update_settings", socket, payload), do: update_settings(socket, payload)
  defp action("update_location", socket, payload), do: update_location(socket, payload)
  defp action("start_round", socket, payload), do: start_round(socket, payload)
  defp action("new_game", socket, payload), do: new_game(socket, payload)
  defp action("next_question", socket, payload), do: next_question(socket, payload)
  defp action("buzz", socket, payload), do: buzz(socket, payload)
  defp action(_, socket, _), do: {:reply, {:ok, "nothing to see here"}, socket}

  defp broadcast_start(socket, _) do
    broadcast(socket, "start", %{})
    {:noreply, socket}
  end

  defp new_game(socket, payload) do
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

  defp start_round(socket, payload) do
    game =
      Server.get_game(game_code(socket.topic))
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


  defp next_question(socket, payload) do
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

  defp update_location(socket, payload) do

    metas =
      Presence.get_by_key(socket.topic, socket.assigns.name)[:metas]
      |> List.first()
      |> Map.merge(%{location: Map.get(payload, "location")})

      Presence.update(self(), socket.topic, socket.assigns.name, metas)

    {:noreply, socket}
  end

  defp update_settings(socket, payload) do
    settings = Settings.apply_settings(Settings.new, Map.get(payload, "settings", %{}))
    broadcast_from(socket, "update_settings", %{
      "settings" => settings
    })
    {:noreply, socket}
  end
end
