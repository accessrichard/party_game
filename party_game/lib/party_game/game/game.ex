defmodule PartyGame.Game.Game do
  alias PartyGame.Game.Round
  alias PartyGame.Game.Question
  alias PartyGame.EctoHelpers

  use Ecto.Schema

  @primary_key false
  schema "games" do
    field(:players, :map, default: [])
    embeds_many(:rounds, Round)
    field(:started, :boolean, default: false)
    field(:round_started, :boolean, default: false)
    field(:room_name, :string, default: nil)
    field(:room_owner, :string, default: nil)
    field(:name, :string, default: nil)
    field(:is_over, :boolean, default: false)
    embeds_many(:questions, Question)
  end

  def create_game_changeset(game, params \\ %{}) do

    rounds = EctoHelpers.create_embedded_changeset(params, :rounds, &Round.changeset/1)

    questions = EctoHelpers.create_embedded_changeset(params, :questions, &Round.changeset/1)

    game
    |> Ecto.Changeset.cast(params, [
      :players,
      :started,
      :round_started,
      :room_name,
      :room_owner,
      :name,
      :is_over
    ])
    |> EctoHelpers.require_field(:questions)
    |> Ecto.Changeset.put_embed(:rounds, rounds)
    |> Ecto.Changeset.put_embed(:questions, questions)
    |> Ecto.Changeset.validate_required([:name])
  end

  def new(fields \\ []), do: __struct__(fields)
end
