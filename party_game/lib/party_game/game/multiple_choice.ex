defmodule PartyGame.Game.MultipleChoice do
  alias PartyGame.Game.Round
  alias PartyGame.Game.Question
  alias PartyGame.Game.Player
  alias PartyGame.Game.MultipleChoiceSettings
  alias PartyGame.EctoHelpers

  use Ecto.Schema

  @primary_key false
  embedded_schema do
    embeds_many(:rounds, Round, on_replace: :delete)
    embeds_many(:players, Player, on_replace: :delete)
    embeds_one(:settings, MultipleChoiceSettings, on_replace: :delete)
    field(:started, :boolean, default: false)
    field(:round_started, :boolean, default: false)
    field(:room_name, :string, default: nil)
    field(:room_owner, :string, default: nil)
    field(:name, :string, default: nil)
    field(:is_over, :boolean, default: false)
    embeds_many(:questions, Question, on_replace: :delete)
  end

  def create_game(game, params \\ %{}) do
    create_game_changeset(game, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_game_changeset(game, params \\ %{}) do
    rounds =
      EctoHelpers.create_embedded_changesets(params, "rounds", %Round{}, &Round.changeset/2)

    settings = MultipleChoiceSettings.apply_settings(Map.get(params, "settings", MultipleChoiceSettings.new()))

    players =
      EctoHelpers.create_embedded_changesets(params, "players", %Player{}, &Player.changeset/2)

    questions =
      EctoHelpers.create_embedded_changesets(
        params,
        "questions",
        %Question{},
        &Question.changeset/2
      )

    game
    |> Ecto.Changeset.cast(params, [
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
    |> Ecto.Changeset.put_embed(:players, players)
    |> Ecto.Changeset.put_embed(:settings, settings)
    |> Ecto.Changeset.validate_required([:name])
  end

  def new(fields \\ []) do
    game = __struct__(fields)

    if game.settings === nil do
      %{game | settings: MultipleChoiceSettings.new()}
    else
      game
    end
  end
end
