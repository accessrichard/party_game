defmodule PartyGame.Game.Question do

  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:question, :answers]}
  embedded_schema do
    field :answers, {:array, :string}, default: []
    field :question, :string
    field :correct, :string
  end

  def changeset(question, params \\ %{}) do
    question
    |> Ecto.Changeset.cast(params, [:answers, :question, :correct])
    |> Ecto.Changeset.validate_required([:answers, :question, :correct])
  end

  def new(fields \\ []), do: __struct__(fields)
end
