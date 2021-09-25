defmodule PartyGame.Games.Games do
  def list() do
    [
      %{"name" => "Basic Math", "module" => PartyGame.Games.BasicMath, "type" => "server"},
      %{"name" => "States", "module" => PartyGame.Games.States, "type" =>  "server"}
    ]
  end

  def new(name, num) do
    game = Enum.find(list(), fn (x) ->  x["name"] === name end)

    case game do
      nil -> {:error, "Game does not exist!"}
      _ -> game["module"].new(num)
    end
  end

  def names() do
    Enum.map(
      PartyGame.Games.Games.list(),
      fn x -> %{:name => x["name"], :type => x["type"]} end
    )
  end
end
