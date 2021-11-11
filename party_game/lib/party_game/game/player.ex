defmodule PartyGame.Game.Player do

  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:name, :status, :location]}
  schema "player" do
    field(:name, :string, default: nil)
    field(:wins, :integer, default: 0)
  end

  def changeset(player, params \\ %{}) do
    player
    |> Ecto.Changeset.cast(params, [
      :name,
      :status,
      :location
    ])
    |> Ecto.Changeset.validate_required([:name])
  end

  def add_player(%{} = params) do
    %PartyGame.Game.Player{}
    |> Ecto.Changeset.cast(params, [:name, :status, :location])
    |> Ecto.Changeset.apply_changes()
  end

  def add_player(player_name) do
    %PartyGame.Game.Player{}
    |> Ecto.Changeset.cast(%{name: player_name}, [:name])
    |> Ecto.Changeset.apply_changes()
  end

end
