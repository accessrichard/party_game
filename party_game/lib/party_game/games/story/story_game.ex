defmodule PartyGame.Games.Story.StoryGame do
  alias PartyGame.Game.{Story, StoryToken}
  alias PartyGame.FileLoader

  @stories_path "./lib/party_game/games/story/prebuilt"

  def new(%Story{} = story \\ %Story{}, options \\ %{}) do
    Story.create_story(story, options)
  end

  def add_story(%Story{} = story) do
    {name, tokens} = story()
    %{story | name: name, tokens: tokenize(tokens)}
  end

  def update_token(%Story{} = story, %StoryToken{} = new_token) do
    updated_tokens =
      Enum.map(story.tokens, fn existing_token ->
        if existing_token.id == new_token.id do
          new_token
        else
          existing_token
        end
      end)

    %{story | tokens: updated_tokens}
   end

  @doc """
  Takes a story with form fields represented by brackets [] and tokenizes
  it for the ui to display inputs where the brackets are.

   ## Examples

      iex> PartyGame.Games.Story.StoryGame.tokenize("This boy [noun] like an [adjective]...")
      [
        %PartyGame.Game.StoryToken{
          id: 0,
          type: "text",
          placeholder: nil,
          value: "This boy ",
          errors: nil
        },
        %PartyGame.Game.StoryToken{
          id: 1,
          type: "input",
          placeholder: "noun",
          value: nil,
          errors: nil
        },
        %PartyGame.Game.StoryToken{
          id: 2,
          type: "text",
          placeholder: nil,
          value: " like an ",
          errors: nil
        },
        %PartyGame.Game.StoryToken{
          id: 3,
          type: "input",
          placeholder: "adjective",
          value: nil,
          errors: nil
        },
        %PartyGame.Game.StoryToken{
          id: 4,
          type: "text",
          placeholder: nil,
          value: "...",
          errors: nil
        }
      ]
  """
  def tokenize(input), do: tokenize(input, :text, "", 0, [])

  def tokenize(<<"[", rest::binary>>, :text, text, id, acc),
    do: tokenize(rest, "", id + 1, [text(id, text) | acc])

  def tokenize(<<"]", rest::binary>>, :text, _, _, _),
    do: "error: excess closing bracket near " <> String.slice(rest, 0, 10)

  def tokenize(<<r::binary-size(1), rest::binary>>, :text, text, id, acc),
    do: tokenize(rest, :text, text <> r, id, acc)

  def tokenize(_, :text, text, id, acc), do: Enum.reverse([text(id, text) | acc])

  def tokenize(<<"[", rest::binary>>, _, _, _),
    do: "error: nested opening bracket near" <> String.slice(rest, 0, 10)

  def tokenize("", rest, _, _),
    do: "error: missing closing bracket near " <> String.slice(rest, 0, 10)

  def tokenize(<<"]", rest::binary>>, concat_str, id, acc),
    do: tokenize(rest, :text, "", id + 1, [input(id, concat_str) | acc])

  def tokenize(<<s::binary-size(1), rest::binary>>, concat_str, id, acc),
    do: tokenize(rest, concat_str <> s, id, acc)

  def story() do
    story_path = Enum.take_random(prebuilt_stories(), 1)
    story = File.read!(story_path)
    name = FileLoader.filename(story_path)
    {name, story}
  end

  def input(id, placeholder) do
    %StoryToken{type: "input", placeholder: placeholder, id: id}
  end

  def text(id, value) do
    %StoryToken{type: "text", value: value, id: id}
  end

  def prebuilt_stories() do
    FileLoader.ls_r(@stories_path)
  end
end
