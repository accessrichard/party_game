defmodule PartyGame.Games.Games do
  alias PartyGame.Games.MultipleChoice
  alias PartyGame.Game.GameMetaData

  def list() do
    games = [
      %GameMetaData{
        name: "Basic Math",
        category: "Math",
        type: "multi_choice",
        location: "server",
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Addition",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "addition"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Subtraction",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "subtraction"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "multiplication"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_multiply"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "division"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_divide"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Equations",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "equation"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "U.S. State Capitals",
        category: "United States",
        type: "multi_choice",
        location: "server",
        module: MultipleChoice.States
      },
      %GameMetaData{
        name: "",
        category: "User Games",
        type: "custom",
        location: "client",
        module: MultipleChoice.BuildYourOwn
      }
    ]

    games ++
      Enum.map(MultipleChoice.BuildYourOwnPrebuilt.prebuilt_games(), fn x ->
        %GameMetaData{
          name: x.name,
          module: MultipleChoice.BuildYourOwnPrebuilt,
          type: "multi_choice",
          location: "server",
          category: x.category
        }
      end)
  end

  def generate_questions(game) do
    name = Map.get(game, :name)
    location = Map.get(game, :location)

    game_metadata =
      Enum.find(list(), fn x ->
        (x.name == name and x.location == location) or
          (x.location == location and location == "client")
      end)

    num_rounds = Map.get(game, :rounds, 10)

    case game_metadata do
      nil ->
        {:error, "Game does not exist!"}

      _ ->
        questions = game_metadata.module.new(game, Map.get(game_metadata, "options", %{}))

        # Shuffle questions for client games
        if location == "client" || game_metadata.module === Games.BuildYourOwnPrebuilt do
          shuffle_questions(questions)
          |> shuffle_question_answers()
          |> Enum.take(num_rounds)
        else
          Enum.take(questions, num_rounds)
        end
    end
  end

  def non_blank_game_list(game_list) do
    Enum.filter(game_list, &(&1.name !== ""))
  end

  def sort_game_list(game_list) do
    Enum.sort(game_list, &(&1.category > &2.category))
  end

  def shuffle_questions(questions) do
    Enum.shuffle(questions)
  end

  def cached_game_list() do
    {_, games} =
      Cachex.fetch(
        :party_game_cache,
        "game_list",
        fn _ ->
          list()
          |> non_blank_game_list
          |> sort_game_list
        end,
        ttl: :timer.minutes(5)
      )
    games
  end

  def shuffle_question_answers(questions) do
    Enum.map(questions, fn x ->
      if length(x.answers) > 2 do
        %PartyGame.Game.Question{x | answers: Enum.shuffle(x.answers)}
      else
        x
      end
    end)
  end
end
