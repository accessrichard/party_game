defmodule PartyGame.Lobby do
  alias PartyGame.Game.Player
  alias PartyGame.Server
  alias PartyGame.Game.MultipleChoice

  def gen_room_name(%{game: game}) do
    %{game | room_name: Server.room_name()}
  end

  def add_player(%{game: game}, %{} = player) do
    player_name = Map.get(player, "name")

    with {:ok, _} <- game_stopped(game),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game, player_name) do
      %{
        game
        | players: [Player.add_player(player) | game.players],
          room_owner: game.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player(%{game: game}, player_name) do
    with {:ok, _} <- game_stopped(game),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game, player_name) do
      %{
        game
        | players: [Player.add_player(player_name) | game.players],
          room_owner: game.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player!(%{game: game}, player_name) do
    with %{game: updated_game} <- add_player(game, player_name) do
      updated_game
    else
      error -> raise error
    end
  end

  def update_settings(%{game: _game}, _settings) do
    #%{game | settings: MultipleChoiceSettings.apply_settings(game.settings, settings)}
  end

  def name_taken(%{game: game}, player_name) do
    case player_exists?(game, player_name) do
      false -> {:ok, player_name}
      true -> {:error, %{player_name: "Name taken. Choose a different name."}}
    end
  end

  def player_exists?(%{game: game}, player_name) do
    case Enum.find(game.players, fn player -> player.name == player_name end) do
      nil -> false
      _ -> true
    end
  end

  def remove_player(%MultipleChoice{} = game, player_name) do
    %{game | players: Enum.filter(game.players, &(&1.name !== player_name))}
  end

  def update_player(%MultipleChoice{} = game, %Player{} = player) do
    %{
      game
      | players:
          Enum.map(game.players, fn p ->
            if p.name == player.name, do: player, else: p
          end)
    }
  end

  def update_room_owner(%MultipleChoice{} = game, owner) do
    %{game | room_owner: owner}
  end

  def get_player(%{game: game}, player) do
    Enum.find(game.players, &(&1.name == player.name))
  end

  defp game_stopped(%{started: true}), do: {:error, "Game is already started."}
  defp game_stopped(%{started: false}), do: {:ok, false}

  defp required(nil, field), do: {:error, "#{field} is required"}
  defp required("", field), do: required(nil, field)
  defp required(name, _field), do: {:ok, name}
end
