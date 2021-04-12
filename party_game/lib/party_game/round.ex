defmodule PartyGame.Round do

  @derive Jason.Encoder
  defstruct question: nil, winner: nil, answer: nil

  def new(fields \\ []), do: __struct__(fields)
end
