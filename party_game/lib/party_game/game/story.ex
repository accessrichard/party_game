defmodule PartyGame.Game.StoryToken do
  use Ecto.Schema

  @primary_key false
  @derive {Jason.Encoder, only: [:id, :type, :placeholder, :value, :errors]}
  schema "storytoken" do
    field(:id, :integer, default: nil)
    field(:type, :string, default: nil)
    field(:placeholder, :string, default: nil)
    field(:value, :string, default: nil)
    field(:errors, {:array, :string}, default: [])
  end
end

defmodule PartyGame.Game.Story do
  use Ecto.Schema
  alias PartyGame.Game.StoryToken

  @derive {Jason.Encoder, only: [:name, :tokens]}
  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    embeds_many(:tokens, StoryToken, on_replace: :delete)
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
