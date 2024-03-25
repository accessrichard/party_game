defmodule PartyGame.Games.Hangman.HangmanGame do
  alias PartyGame.Game.Hangman
  alias PartyGame.Game.GameRoom
  alias PartyGame.Games.Canvas.CanvasGame

  def new(game, _options \\ %{}) do
    Hangman.create_game(%Hangman{}, game)
  end

  def guess(%GameRoom{} = game_room, guess) do
    guesses = Map.get(game_room.game, :guesses, [])

    %{
      game_room
      | game: %{
          game_room.game
          | guesses: [guess | guesses],
            display_word: display_word(game_room.game.word, [guess | guesses])
        }
    }
  end

  def display_word(word, guesses) do
    Enum.map(String.codepoints(word), &Enum.find([" " | guesses], fn x -> &1 == x || &1 == " " end))
    |> Enum.map(&if &1 == nil, do: "_", else: &1)
    |> List.to_string()
  end

  def change_word(%GameRoom{} = game_room) do
    if game_room.game.words == [] do
      word = Enum.at(word(1, game_room.game.settings.difficulty), 0)
      %{game_room | game: %{game_room.game | word: word, display_word: display_word(word, []), is_over: false}}
    else
      index =
        CanvasGame.find_index_round_robin(game_room.game.words, &(game_room.game.word == &1))

      is_over = game_room.game.word != nil && index == 0
      word = Enum.at(game_room.game.words, index)
      %{game_room | game: %{game_room.game | word: word, display_word: display_word(word, []), is_over: is_over}}
    end
  end

  def word(count, difficulty \\ "easy") do
    PartyGame.Games.Canvas.CanvasGame.word(count, difficulty)
  end
end
