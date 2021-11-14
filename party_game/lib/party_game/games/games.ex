defmodule PartyGame.Games.Games do
  def list() do
    [
      %{
        "name" => "Basic Math",
        "module" => PartyGame.Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server"
      },
      %{
        "name" => "Addition",
        "module" => PartyGame.Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "addition"}
      },
      %{
        "name" => "Subtraction",
        "module" => PartyGame.Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "subtraction"}
      },
      %{
        "name" => "Multiplication",
        "module" => PartyGame.Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "multiplication"}
      },
      %{
        "name" => "Division",
        "module" => PartyGame.Games.BasicMath,
        "type" => "multi_choice",
        "location" => "server",
        "options" => %{"type" => "division"}
      },
      %{
        "name" => "States",
        "module" => PartyGame.Games.States,
        "type" => "multi_choice",
        "location" => "server"
      },
      %{
        "name" => "United States Geography Trivia",
        "module" => PartyGame.Games.BuildYourOwnPrebuilt,
        "type" => "multi_choice",
        "location" => "server"
      },
      %{
        "name" => "",
        "module" => PartyGame.Games.BuildYourOwn,
        "type" => "custom",
        "location" => "client"
      }
    ]
  end

  def generate_questions(game) do
    name = Map.get(game, :name)
    location = Map.get(game, :location)

    server_game =
      Enum.find(list(), fn x ->
        (x["name"] == name and x["location"] == location) or
          (x["location"] == location and location == "client")
      end)

    case server_game do
      nil -> {:error, "Game does not exist!"}
      _ -> server_game["module"].new(game,  Map.get(server_game, "options", %{}))
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
