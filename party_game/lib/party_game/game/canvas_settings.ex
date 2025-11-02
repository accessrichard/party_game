defmodule PartyGame.Game.CanvasSettings do

  use Ecto.Schema
  @primary_key false
  @derive {Jason.Encoder, only: [:difficulty]}
  embedded_schema do
    field(:difficulty, :string, default: "easy")
    field(:round_time, :integer, default: 45000)
  end

  def apply_settings(settings, params \\ %{}) do
    settings
    |> Ecto.Changeset.cast(params, [:difficulty])
    |> Ecto.Changeset.cast(params, [:round_time])
    |> Ecto.Changeset.apply_changes()
  end

  def new(fields \\ %{}), do: __struct__(fields)
end
