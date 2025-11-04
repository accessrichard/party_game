defmodule PartyGame.Game.Player do

  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:name, :wins]}
  schema "player" do
    field(:name, :string, default: nil)
    field(:wins, :integer, default: 0)
    field(:location, :string, default: nil)
    field(:last_active_at, :utc_datetime, default: nil)
    field(:display_size, {:array, :float}, default: [])
  end

  def changeset(player, params \\ %{}) do
    player
    |> Ecto.Changeset.cast(params, [
      :name,
      :wins,
      :display_size,
      :location,
      :last_active_at
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

  def touch_last_active_at(%PartyGame.Game.Player{} = player) do
    player
    |> changeset(%{last_active_at: DateTime.utc_now()})
    |> Ecto.Changeset.apply_changes()
  end

  def is_inactive?(%PartyGame.Game.Player{} = player, inactive_time \\ 10) do
    if player.last_active_at == nil do
      false
    else
      DateTime.diff(DateTime.utc_now(), player.last_active_at) > inactive_time
    end

  end

end
