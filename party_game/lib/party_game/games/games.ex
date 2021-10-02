defmodule PartyGame.Games.Games do
  def list() do
    [
      %{"name" => "Basic Math", "module" => PartyGame.Games.BasicMath, "type" => "server"},
      %{"name" => "States", "module" => PartyGame.Games.States, "type" => "server"},
      %{"name" => "", "module" => PartyGame.Games.BuildYourOwn, "type" => "client"}
    ]
  end

  def new(game) do
    name = Map.get(game, :name)
    type = Map.get(game, :type)

    server_game =
      Enum.find(list(), fn x ->
        (x["name"] == name and x["type"] == type) or
          (x["type"] == type and type == "client")
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
      fn x -> %{:name => x["name"], :type => x["type"]} end
    )
  end
end
