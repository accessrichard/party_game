defmodule PartyGame.Game.Hangman do
  use Ecto.Schema

  alias PartyGame.Game.HangmanSettings

  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    field(:word, :string, default: nil)
    field(:words, {:array, :string}, default: [])
    field(:display_word, :string, default: nil)
    field(:guesses, {:array, :string}, default: [])
    field(:over?, :boolean, default: false)
    embeds_one(:settings, HangmanSettings, on_replace: :delete)
  end

  def create_game(game, params \\ %{}) do
    create_changeset(game, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_changeset(game, params \\ %{}) do
    settings = HangmanSettings.apply_settings(HangmanSettings.new, Map.get(params, :settings, %{}))

    game
    |> Ecto.Changeset.cast(params, [
      :name,
      :word,
      :words,
      :guesses,
      :display_word,
      :over?])
      |> Ecto.Changeset.put_embed(:settings, settings)
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
