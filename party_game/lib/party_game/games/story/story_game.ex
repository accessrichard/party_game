defmodule PartyGame.Games.Story.StoryGame do
  alias PartyGame.Game.GameRoom
  alias PartyGame.Game.{Story, StoryToken}
  alias PartyGame.FileLoader
  alias PartyGame.Lobby

  require Logger

  @stories_path "./lib/party_game/games/story/prebuilt"

  def create(%Story{} = story \\ %Story{}, options \\ %{}) do
    case options["text"] do
      nil ->
        story = Story.create_story(story, options)
        add_story(story)
      _ ->
        options = Map.put(options, "tokens", tokenize(options["text"]))
        Story.create_story(story, options)
    end
  end

  def add_story(%Story{} = story) do
    {name, tokens} = story()
    %{story | name: name, tokens: tokenize(tokens)}
  end

  def advance(%GameRoom{} = game_room) do
    case game_room.game.type do
      "alternate_word" ->
        change_turn(game_room)
        |> next_input_token()

      "alternate_sentence" ->
        change_turn(game_room)
        |> next_sentence_token()

      "alternate_story" ->
        change_turn(game_room)
    end
  end

  def next_input_token(%GameRoom{} = game_room) do
    next_token_index =
      PartyGame.Lobby.find_index_round_robin(
        game_room.game.tokens,
        &(&1.id > game_room.game.token_index && &1.type == "input")
      )

    %{
      game_room
      | game: %{
          game_room.game
          | token_index: next_token_index - 1,
            over?: next_token_index == 0
        }
    }
  end

  def next_sentence_token(%GameRoom{} = game_room) do
    next_token_index =
      PartyGame.Lobby.find_index_round_robin(
        game_room.game.tokens,
        &(&1.id > game_room.game.token_index && &1.type == "input")
      )

    until_token_index =
      PartyGame.Lobby.find_index_round_robin(
        game_room.game.tokens,
        &(&1.id > next_token_index && &1.type == "text" && String.contains?(&1.value, ". "))
      )

    until_token_index =
      if until_token_index == 0,
        do: 999,
        else: until_token_index

    %{
      game_room
      | game: %{
          game_room.game
          | token_index: until_token_index - 1,
            over?: next_token_index == 0
        }
    }
  end

  def update_token(%GameRoom{} = game_room, %StoryToken{} = new_token) do
    updated_tokens =
      Enum.map(game_room.game.tokens, fn existing_token ->
        if existing_token.id == new_token.id do
          new_token
        else
          existing_token
        end
      end)

    %{game_room | game: %{game_room.game | tokens: updated_tokens, token_index: new_token.id}}
  end

  def update_tokens(%GameRoom{} = game_room, []) do
    %{game_room | game: %{game_room.game | token_index: List.last(game_room.game.tokens).id}}
  end

  def update_tokens(%GameRoom{} = game_room, new_tokens) do
    new_token_map = Map.new(new_tokens, fn token -> {token.id, token} end)
    last_updated_id = List.last(new_tokens).id

    updated_tokens =
      Enum.map(game_room.game.tokens, fn existing_token ->
        case Map.get(new_token_map, existing_token.id) do
          nil ->
            existing_token

          new_token ->
            new_token
        end
      end)

    %{game_room | game: %{game_room.game | tokens: updated_tokens, token_index: last_updated_id}}
  end

  def change_turn(%GameRoom{} = game_room) do
    player = Lobby.next_turn(game_room, game_room.game.turn)
    %{game_room | game: %{game_room.game | turn: player.name}}
  end

  @doc """
  Takes a story with form fields represented by brackets [] and tokenizes
  it for the ui to display inputs where the brackets are.

   ## Examples

      iex> PartyGame.Games.Story.StoryGame.tokenize("This boy [noun] like an [adjective]...")
      [
        %PartyGame.Game.StoryToken{
          __meta__: #Ecto.Schema.Metadata<:built, "storytoken">,
          id: 0,
          type: "text",
          placeholder: "",
          value: "This boy ",
          errors: []
        },
        %PartyGame.Game.StoryToken{
          __meta__: #Ecto.Schema.Metadata<:built, "storytoken">,
          id: 1,
          type: "input",
          placeholder: "noun",
          value: "",
          errors: []
        },
        %PartyGame.Game.StoryToken{
          __meta__: #Ecto.Schema.Metadata<:built, "storytoken">,
          id: 2,
          type: "text",
          placeholder: "",
          value: " like an ",
          errors: []
        },
        %PartyGame.Game.StoryToken{
          __meta__: #Ecto.Schema.Metadata<:built, "storytoken">,
          id: 3,
          type: "input",
          placeholder: "adjective",
          value: "",
          errors: []
        },
        %PartyGame.Game.StoryToken{
          __meta__: #Ecto.Schema.Metadata<:built, "storytoken">,
          id: 4,
          type: "text",
          placeholder: "",
          value: "...",
          errors: []
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
