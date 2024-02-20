defmodule PartyGame.Game.GameRoom do
  alias PartyGame.Game.Player
  alias PartyGame.EctoHelpers

  use Ecto.Schema

  @primary_key false
  embedded_schema do
    embeds_many(:players, Player, on_replace: :delete)
    field(:started, :boolean, default: false)
    field(:room_name, :string, default: nil)
    field(:room_owner, :string, default: nil)
    field(:is_over, :boolean, default: false)
    field(:game, :map, default: nil)
  end

  def create_game(game, params \\ %{}) do
    create_game_changeset(game, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_game_changeset(game, params \\ %{}) do
    players =
      EctoHelpers.create_embedded_changesets(params, "players", %Player{}, &Player.changeset/2)

    game
    |> Ecto.Changeset.cast(params, [
      :started,
      :room_name,
      :room_owner,
      :is_over,
      :game
    ])
    |> Ecto.Changeset.put_embed(:players, players)
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
