defmodule PartyGame.Games.Games do
  def list() do
    %{"Basic Math" => PartyGame.Games.BasicMath, "States" => PartyGame.Games.States}
  end

  def new(name, num) do
    games = Map.get(PartyGame.Games.Games.list(), name)

    case games do
      nil -> {:error, "Game does not exist!"}
      _ ->  games.new(num)
    end
  end

  def keys() do
    Map.keys(list())
  end
end
