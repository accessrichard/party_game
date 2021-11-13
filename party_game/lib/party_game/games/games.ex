defmodule PartyGame.Games.Games do
  def list() do
    [
      %{"name" => "Basic Math", "module" => PartyGame.Games.BasicMath, "type" => "multi_choice", "location" => "server"},
      %{"name" => "States", "module" => PartyGame.Games.States, "type" => "multi_choice", "location" => "server"},
      %{"name" => "", "module" => PartyGame.Games.BuildYourOwn, "type" => "custom", "location" => "client"}
    ]
  end

  def new(game) do
    name = Map.get(game, :name)
    location = Map.get(game, :location)

    server_game =
      Enum.find(list(), fn x ->
        (x["name"] == name and x["location"] == location) or
          (x["location"] == location and location == "client")
      end)

    case server_game do
      nil -> {:error, "Game does not exist!"}
      _ -> server_game["module"].new(game)
    end
  end

  def names() do
    non_empty = Enum.filter(list(), &(&1["name"] !== ""))

    Enum.map(
      non_empty,
      fn x -> %{:name => x["name"], :location => x["location"], :type => x["type"]} end
    )
  end
end
