defmodule PartyGame.Games.CanvasDraw.CanvasGame do
  alias PartyGame.Game.Question
  @word_path "./lib/party_game/games/canvas_draw"

  def new(game) do
    new(game, nil)
  end

  def new(game, _) do
    number_questions = Map.get(game, :rounds, 10)
    words = word(number_questions)

    Enum.reduce(words, [], fn word, acc ->
      [
        %Question{
          question: "Draw #{word}",
          answers: [],
          correct: nil,
          id: Ecto.UUID.autogenerate()
        }
        | acc
      ]
    end)
  end

  def word(count) do
    json = File.read!(Path.join(@word_path, "drawings.json"))
    list = Jason.decode!(json)
    Enum.take_random(list, count)
  end
end
