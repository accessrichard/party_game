defmodule PartyGame.Game.Round do

  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:question, :answer, :winner]}
  embedded_schema do
    field :question, :string
    field :answer, :string
    field :winner, :string
  end

  def changeset(round, params \\ %{}) do
    round
    |> Ecto.Changeset.cast(params, [:answer, :question, :winner])
    |> Ecto.Changeset.validate_required([:answer, :question, :winner])
  end


  def new(fields \\ []), do: __struct__(fields)
end
