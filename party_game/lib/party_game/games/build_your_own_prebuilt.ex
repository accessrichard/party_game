defmodule PartyGame.Games.BuildYourOwnPrebuilt do

  @games_path "./lib/party_game/games/prebuilt"

  def new(game, _) do
    name = Map.get(game, :name) || Map.get(game, "name")
    location = Enum.find(prebuilt_games(), &(&1.name === name))
    json = File.read!(location.path)
    new_game = PartyGame.Game.Game.create_game(PartyGame.Game.Game.new(), Jason.decode!(json))
    new_game.questions
  end

  def prebuilt_games() do
    games = ls_r(@games_path)
    game_list(games, @games_path)
  end

  def game_list(list, base_path) when is_list(list) do
    Enum.map(list, fn file ->
      %{
        name: Path.basename(file, ".json"),
        category: category(file, base_path),
        path: file
      }
    end)
  end

  def category(file, base_path) do
    if Path.dirname(file) == base_path do
      nil
    else
      List.last(Path.split(Path.dirname(file)))
    end
  end

  def ls_r(path \\ ".") do
    cond do
      File.regular?(path) -> [path]
      File.dir?(path) ->
        File.ls!(path)
        |> Enum.map(&Path.join(path, &1))
        |> Enum.map(&ls_r/1)
        |> Enum.concat
      true -> []
    end
  end
end
