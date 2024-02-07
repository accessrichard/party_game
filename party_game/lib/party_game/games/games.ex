defmodule PartyGame.Games.Games do
  alias PartyGame.Games

  def list() do
    games = [
      %{
        "name" => "Basic Math",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server"
      },
      %{
        "name" => "Addition",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "addition"}
      },
      %{
        "name" => "Subtraction",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "subtraction"}
      },
      %{
        "name" => "Multiplication",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "multiplication"}
      },
      %{
        "name" => "Multiplication - Fractions",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "fraction_multiply"}
      },
      %{
        "name" => "Division",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "division"}
      },
      %{
        "name" => "Division - Fractions",
        "module" => Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "fraction_divide"}
      },
      %{
        "name" => "U.S. State Capitals",
        "module" => Games.States,
        "type" => "multi_choice",
        "location" => "server"
      },
      %{
        "name" => "",
        "module" => Games.BuildYourOwn,
        "type" => "custom",
        "location" => "client"
      }
    ]

    games ++
      Enum.map(Games.BuildYourOwnPrebuilt.prebuilt_games(), fn x ->
        %{
          "name" => x.name,
          "module" => Games.BuildYourOwnPrebuilt,
          "type" => "multi_choice",
          "location" => "server"
        }
      end)
  end

  def generate_questions(game) do
    name = Map.get(game, :name)
    location = Map.get(game, :location)

    game_list =
      Enum.find(list(), fn x ->
        (x["name"] == name and x["location"] == location) or
          (x["location"] == location and location == "client")
      end)

    num_rounds = Map.get(game, :rounds, 10)

    case game_list do
      nil ->
        {:error, "Game does not exist!"}

      _ ->
        questions = game_list["module"].new(game, Map.get(game_list, "options", %{}))

        # Shuffle questions for client games
        if location == "client" || game_list["module"] === Games.BuildYourOwnPrebuilt do
          shuffle_questions(questions)
          |> shuffle_question_answers()
          |> Enum.take(num_rounds)
        else
          Enum.take(questions, num_rounds)
        end
    end
  end

  def names() do
    non_empty = Enum.filter(list(), &(&1["name"] !== ""))

    Enum.map(
      non_empty,
      fn x -> %{:name => x["name"], :location => x["location"], :type => x["type"]} end
    )
  end

  def shuffle_questions(questions) do
    Enum.shuffle(questions)
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
