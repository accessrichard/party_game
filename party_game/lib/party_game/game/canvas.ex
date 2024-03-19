defmodule PartyGame.Game.Canvas do
  use Ecto.Schema

  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    field(:round_started, :boolean, default: false)
    field(:turn, :string, default: nil)
    field(:word, :string, default: nil)
    field(:type, :string, default: nil)
    field(:words, {:array, :string}, default: [])
    field(:guesses, {:array, :string}, default: [])
    field(:winner, :string, default: nil)
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
      :type,
      :turn,
      :word,
      :words,
      :guesses,
      :winner
    ])
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
