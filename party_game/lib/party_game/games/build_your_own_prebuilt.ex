defmodule PartyGame.Games.BuildYourOwnPrebuilt do

  @games_path "./lib/party_game/games/prebuilt/"

  def new(game, _) do
    name = Map.get(game, :name) || Map.get(game, "name")
    location = Enum.find(prebuilt_games(), &(&1.name === name))
    json = File.read!(location.path)
    new_game = PartyGame.Game.Game.create_game(PartyGame.Game.Game.new(), Jason.decode!(json))
    new_game.questions
  end

  def prebuilt_games() do
   File.ls!(@games_path)
    |> Enum.filter(&(Path.extname(&1) === ".json"))
    |> Enum.map(&(%{
        name: String.replace(Path.basename(&1, ".json"), "_", " "),
        path: Path.join(@games_path, &1)
        }))
  end
end
