defmodule PartyGame.Game.Player do

  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:name, :wins]}
  schema "player" do
    field(:name, :string, default: nil)
    field(:wins, :integer, default: 0)
    field(:display_size, {:array, :float}, default: [])
  end

  def changeset(player, params \\ %{}) do
    player
    |> Ecto.Changeset.cast(params, [
      :name,
      :wins,
      :display_size
    ])
    |> Ecto.Changeset.validate_required([:name])
  end

  def apply_changeset(player, params \\ %{}) do
    changeset(player, params) |> Ecto.Changeset.apply_changes()
  end


  def add_player(%{} = params) do
    %PartyGame.Game.Player{}
    |> Ecto.Changeset.cast(params, [:name, :wins])
    |> Ecto.Changeset.apply_changes()
  end

  def add_player(player_name) do
    %PartyGame.Game.Player{}
    |> Ecto.Changeset.cast(%{name: player_name}, [:name])
    |> Ecto.Changeset.apply_changes()
  end

end
