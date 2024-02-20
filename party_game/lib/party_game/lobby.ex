defmodule PartyGame.Lobby do
  alias PartyGame.Game.Player
  alias PartyGame.Server
  alias PartyGame.Game.GameRoom

  def new(fields \\ []) do
    GameRoom.new(fields)
  end

  def set_game(%GameRoom{} = game_room, game) do
    %{game_room | game: game}
  end

  def gen_room_name(%GameRoom{} = game) do
    %{game | room_name: Server.room_name()}
  end

  def start_game(%GameRoom{} = game_room) do
    %{game_room | started: true}
  end

  def stop_game(%GameRoom{} = game_room) do
    %{game_room | started: false}
  end

  def add_player(%GameRoom{} = game_room, %{} = player) do
    player_name = Map.get(player, "name")

    with {:ok, _} <- game_stopped(game_room),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game_room, player_name) do
      %{
        game_room
        | players: [Player.add_player(player) | game_room.players],
          room_owner: game_room.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player(%GameRoom{} = game_room, player_name) do
    with {:ok, _} <- game_stopped(game_room),
         {:ok, _} <- required(player_name, "Player name"),
         {:ok, _} <- name_taken(game_room, player_name) do
      %{
        game_room
        | players: [Player.add_player(player_name) | game_room.players],
          room_owner: game_room.room_owner || player_name
      }
    else
      error -> error
    end
  end

  def add_player!(%GameRoom{} = game_room, player_name) do
    with %GameRoom{} = game <- add_player(game_room, player_name) do
      game
    else
      error -> raise error
    end
  end

  def update_settings(%GameRoom{} = game_room, settings) do
    %{game_room | game: %{game_room.game | settings: settings}}
  end

  def name_taken(%GameRoom{} = game_room, player_name) do
    case player_exists?(game_room, player_name) do
      false -> {:ok, player_name}
      true -> {:error, %{player_name: "Name taken. Choose a different name."}}
    end
  end

  def player_exists?(%GameRoom{} = game, player_name) do
    case Enum.find(game.players, fn player -> player.name == player_name end) do
      nil -> false
      _ -> true
    end
  end

  def remove_player(%GameRoom{} = game, player_name) do
    %{game | players: Enum.filter(game.players, &(&1.name !== player_name))}
  end

  def update_player(%GameRoom{} = game, %Player{} = player) do
    %{
      game
      | players:
          Enum.map(game.players, fn p ->
            if p.name == player.name, do: player, else: p
          end)
    }
  end

  def update_room_owner(%GameRoom{} = game, owner) do
    %{game | room_owner: owner}
  end

  def get_player(%GameRoom{} = game, player) do
    Enum.find(game.players, &(&1.name == player.name))
  end

  defp game_stopped(%{started: true}), do: {:error, "Game is already started."}
  defp game_stopped(%{started: false}), do: {:ok, false}

  defp required(nil, field), do: {:error, "#{field} is required"}
  defp required("", field), do: required(nil, field)
  defp required(name, _field), do: {:ok, name}
end
