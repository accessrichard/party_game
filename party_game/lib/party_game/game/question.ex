defmodule PartyGame.Game.Question do
  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:question, :answers, :id]}
  embedded_schema do
    field(:answers, {:array, :string}, default: [])
    field(:question, :string)
    field(:id, Ecto.UUID)
    field(:correct, :string)
  end

  def changeset(question, params \\ %{}) do
    question
    |> Ecto.Changeset.cast(params, [:answers, :question, :correct, :id])
    |> add_uuid()
    |> Ecto.Changeset.validate_required([:answers, :question, :correct])
  end

  defp add_uuid(%Ecto.Changeset{changes: %{id: nil}} = changeset) do
    Ecto.Changeset.put_change(changeset, :id, Ecto.UUID.autogenerate())
  end

  defp add_uuid(%Ecto.Changeset{data: %PartyGame.Game.Question{id: nil}} = changeset) do
    changeset
    |> Ecto.Changeset.put_change(:id, Ecto.UUID.autogenerate())
  end

  defp add_uuid(changeset) do
    changeset
  end

  def new(fields \\ []), do: __struct__(fields)
end
