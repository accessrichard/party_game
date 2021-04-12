defmodule PartyGame.Question do

  @derive {Jason.Encoder, only: [:question, :answers]}
  defstruct question: nil,
            answers: [],
            correct: nil

  def new(fields \\ []), do: __struct__(fields)
end
