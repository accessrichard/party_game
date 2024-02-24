defmodule PartyGame.Game.Canvas do
  use Ecto.Schema

  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    field(:round_started, :boolean, default: false)
    field(:turn, :string, default: nil)
    field(:word, :string, default: nil)

  end

  def create_game(game, params \\ %{}) do
    create_changeset(game, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_changeset(game, params \\ %{}) do
    game
    |> Ecto.Changeset.cast(params, [
      :round_started,
      :name,
      :turn,
      :word
    ])
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
