defmodule PartyGame.Game.StoryToken do
  defstruct [:id, :type, :placeholder, :value, :errors]
end

defmodule PartyGame.Game.Story do
  use Ecto.Schema
  alias PartyGame.Game.StoryToken

  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    embeds_one(:tokens, StoryToken, on_replace: :delete)
  end

  def create_story(story, params \\ %{}) do
    create_changeset(story, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_changeset(story, params \\ %{}) do
    tokens = Map.get(params, :tokens, [%StoryToken{}])

    story
    |> Ecto.Changeset.cast(params, [
      :name
    ])
    |> Ecto.Changeset.put_embed(:tokens, tokens)
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
