defmodule PartyGame.Game.StoryToken do
  use Ecto.Schema
  alias PartyGame.Game.StoryToken

  @derive {Jason.Encoder, only: [:id, :type, :placeholder, :value, :errors]}
  @primary_key false
  schema "storytoken" do
    field(:id, :integer, default: nil)
    field(:type, :string, default: "")
    field(:placeholder, :string, default: "")
    field(:value, :string, default: "")
    field(:errors, {:array, :string}, default: [])
  end

  def create_token(%StoryToken{} = token, params) do
    create_changeset(token, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_token(params) do
    create_changeset(%StoryToken{}, params)
    |> Ecto.Changeset.apply_changes()
  end

  def create_changeset(token, params \\ %{}) do
    token
    |> Ecto.Changeset.cast(params, [
      :id,
      :type,
      :placeholder,
      :value,
      :errors
    ])
  end

end

defmodule PartyGame.Game.Story do
  use Ecto.Schema
  alias PartyGame.Game.StoryToken

  @derive {Jason.Encoder, only: [:name, :turn, :type, :tokens, :token_index, :updated_by]}
  @primary_key false
  embedded_schema do
    field(:name, :string, default: nil)
    field(:turn, :string, default: nil)
    field(:type, :string, default: "alternate_word")
    field(:token_index, :integer, default: 0)
    field(:updated_by, :string, default: nil)
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
      :name,
      :turn,
      :type,
      :token_index,
      :updated_by
    ])
    |> Ecto.Changeset.put_embed(:tokens, tokens)
  end

  def new(fields \\ []) do
    __struct__(fields)
  end
end
