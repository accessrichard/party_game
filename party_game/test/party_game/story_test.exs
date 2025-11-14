defmodule PartyGame.StoryTest do
  use ExUnit.Case, async: true

  alias PartyGame.Games.Story.StoryGame
  alias PartyGame.Game.Story
  alias PartyGame.Game.StoryToken
  alias PartyGame.Lobby

  describe "Story tests" do
    test "tokenize/1 correctly tokenizes a string with placeholders" do
      input = "This boy [noun] like an [adjective]..."
      tokens = StoryGame.tokenize(input)

      assert [
               %StoryToken{id: 0, type: "text", value: "This boy ", placeholder: ""},
               %StoryToken{id: 1, type: "input", value: "", placeholder: "noun"},
               %StoryToken{id: 2, type: "text", value: " like an ", placeholder: ""},
               %StoryToken{id: 3, type: "input", value: "", placeholder: "adjective"},
               %StoryToken{id: 4, type: "text", value: "...", placeholder: ""}
             ] = tokens
    end

    test "change_turn/1 changes turns" do
      game_room =
        Lobby.new()
        |> Lobby.set_game(StoryGame.create(%Story{}, %{"turn" => "joe"}))
        |> Lobby.add_player("Richard")
        |> Lobby.add_player("joe")
        |> Lobby.add_player("mike")
        |> StoryGame.change_turn()

      assert game_room.game.turn == "Richard"
    end

    test "create/2 creates a story from text" do
      story = StoryGame.create(%Story{}, %{"text" => "A [noun] story."})
      assert story.name == nil
      assert length(story.tokens) == 3
      assert Enum.at(story.tokens, 1).placeholder == "noun"
    end

    test "create/2 creates a story from prebuilt" do
      story = StoryGame.create(%Story{})
      assert is_binary(story.name)
      assert is_list(story.tokens)
      assert length(story.tokens) > 0
    end

    test "advance/1 moves to the next input token for 'alternate_word'" do
      story = StoryGame.create(%Story{}, %{"text" => "A [a] [b] story.", "type" => "alternate_word"})

      game_room =
        Lobby.new()
        |> Lobby.add_player("Richard")
        |> Lobby.set_game(story)
        |> StoryGame.advance()


      assert game_room.game.token_index == 1
      assert game_room.game.over? == false

      game_room = StoryGame.advance(game_room)
      assert game_room.game.token_index == 3
      assert game_room.game.over? == false

      game_room = StoryGame.advance(game_room)

      assert game_room.game.token_index == -1
      assert game_room.game.over? == true
    end

    test "update_token/2 updates a single token" do
      story = StoryGame.create(%Story{}, %{"text" => "A [noun] story."})
      game_room = Lobby.new() |> Lobby.set_game(story)

      new_token = %StoryToken{id: 1, value: "great"}
      updated_game_room = StoryGame.update_token(game_room, new_token)

      updated_token = Enum.find(updated_game_room.game.tokens, &(&1.id == 1))
      assert updated_token.value == "great"
      assert updated_game_room.game.token_index == 1
    end

    test "update_tokens/2 updates multiple tokens" do
      story = StoryGame.create(%Story{}, %{"text" => "A [a] and [b] story."})
      game_room = Lobby.new() |> Lobby.set_game(story)

      new_tokens = [
        %StoryToken{id: 1, value: "first"},
        %StoryToken{id: 3, value: "second"}
      ]

      updated_game_room = StoryGame.update_tokens(game_room, new_tokens)

      first_token = Enum.find(updated_game_room.game.tokens, &(&1.id == 1))
      second_token = Enum.find(updated_game_room.game.tokens, &(&1.id == 3))

      assert first_token.value == "first"
      assert second_token.value == "second"
      assert updated_game_room.game.token_index == 3
    end
  end
end
