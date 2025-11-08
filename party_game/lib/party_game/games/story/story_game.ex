defmodule PartyGame.Games.Story.StoryGame do
  alias PartyGame.Game.Story
  alias PartyGame.FileLoader

  @stories_path "./lib/party_game/games/story/prebuilt"

  def new(game, _options \\ %{}) do
    Story.create_story(%Story{}, game)
  end

  @doc """
  Captures text inbetween '[' and ']' brackets.

   ## Examples

      iex> PartyGame.Games.Story.StoryGame.tokenize("this is [a] [test a]sdf")
      ["a", "test a"]
  """
  def tokenize(input), do: tokenize(input, [])

  def tokenize(<<"[", rest::binary>>, acc), do: tokenize(rest, "", acc)

  def tokenize(<<"]", rest::binary>>, _),
    do: "error: excess closing bracket near " <> String.slice(rest, 0, 10)

  def tokenize(<<_::binary-size(1), rest::binary>>, acc),
    do: tokenize(rest, acc)

  def tokenize(_, acc), do: Enum.reverse(acc)

  def tokenize(<<"[", rest::binary>>, _, _),
    do: "error: nested opening bracket near" <> String.slice(rest, 0, 10)

  def tokenize("", rest, _),
    do: "error: missing closing bracket near " <> String.slice(rest, 0, 10)

  def tokenize(<<"]", rest::binary>>, concat_str, acc),
    do: tokenize(rest, [concat_str | acc])

  def tokenize(<<s::binary-size(1), rest::binary>>, concat_str, acc),
    do: tokenize(rest, concat_str <> s, acc)

  def story() do
    story = Enum.take_random(prebuilt_stories(), 1)
    File.read!(story)
  end

  def prebuilt_stories() do
    FileLoader.ls_r(@stories_path)
  end
end
