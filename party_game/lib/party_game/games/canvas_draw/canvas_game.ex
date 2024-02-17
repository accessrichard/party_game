defmodule PartyGame.Games.CanvasDraw.CanvasGame do
  alias PartyGame.Game.Question
  @word_path "./lib/party_game/games/canvas_draw"

  def new(game, options \\ %{}) do
    type = Map.get(options, "type", "")
    number_questions = Map.get(game, :rounds, 10)

    case type do
      "free_draw" ->
        %Question{}

      _ ->
        questions(number_questions)
    end
  end

  def questions(number_questions) do
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
