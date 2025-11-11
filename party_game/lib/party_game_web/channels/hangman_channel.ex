defmodule PartyGameWeb.HangmanChannel do
    require Logger
    use PartyGameWeb, :channel
    use PartyGameWeb.GameChannel

    alias PartyGame.Server
    alias PartyGame.Lobby
    alias PartyGame.Games.Hangman.HangmanGame

    @channel_name "hangman:"

    @impl true
    def join(@channel_name <> room_name, payload, socket) do
      Logger.info("Join #{@channel_name}#{room_name} for: #{Map.get(payload, "name")}")

      case Server.lookup(room_name) do
        {:ok, _} ->
          name = Map.get(payload, "name")
          socket = assign(socket, :name, name)
          send(self(), {:after_join, payload})
          {:ok, socket}

        _ ->
          send(self(), {:after_join, :game_not_found})
          {:ok, socket}
      end
    end

    @impl true
    def handle_info({:after_join, _}, socket) do
      Server.get_game(game_code(socket.topic))
      |> Lobby.update_player_location(socket.assigns.name, "hangman")
      |> Server.update_game()

      {:noreply, socket}
    end

    @impl true
    def handle_in("end_game", _, socket) do
      game_room = Server.get_game(game_code(socket.topic))
       |> Lobby.update_player_location(socket.assigns.name, "lobby")
       |> Server.update_game()

       broadcast_from(socket, "handle_quit", %{
        "returnToLobby" => socket.assigns.name == game_room.room_owner
       })
       {:noreply, socket}
    end

    @impl true
    def handle_in("word", _, socket) do
      game_room = Server.get_game(game_code(socket.topic))
        |> HangmanGame.change_word
        |> Server.update_game

      broadcast(socket, "word", %{"word" => game_room.game.display_word})
      {:noreply, socket}
    end

    @impl true
    def handle_in("start", _, socket) do
        game_room = Server.get_game(game_code(socket.topic))
        |> HangmanGame.change_word
        |> Server.update_game

      broadcast(socket, "word", %{"word" => game_room.game.display_word})
      {:noreply, socket}
    end

    @impl true
    def handle_in("guess", payload, socket) do
      over? = Map.get(payload, "isOver", false)
      game_room =
        Server.get_game(game_code(socket.topic))
        |> HangmanGame.guess(Map.get(payload, "guess"))
        |> Server.update_game()

      broadcast(socket, "handle_guess", %{
        "word" => game_room.game.display_word,
        "guesses" => HangmanGame.wrong_guesses(game_room),
        "isWinner" => HangmanGame.winner?(game_room),
        "winningWord" => (if over?, do: game_room.game.word, else: "")
      })
      {:noreply, socket}
    end

    @impl true
    def handle_in("new_game", payload, socket) do
      words = Map.get(payload, "words", [])
      settings = Map.get(payload, "settings", %{})

      game_room =
        Server.get_game(game_code(socket.topic))
        |> Lobby.set_game(HangmanGame.new(%{name: "hangman", words: words, settings: settings}))
        |> HangmanGame.change_word()
        |> Server.update_game()

      broadcast(socket, "handle_new_game", %{
        "word" => game_room.game.display_word,
        "guesses" => HangmanGame.wrong_guesses(game_room)
      })

      {:noreply, socket}
    end
  end
