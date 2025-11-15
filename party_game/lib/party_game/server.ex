defmodule PartyGame.Server do
  use GenServer, restart: :transient
  alias PartyGame.Game.GameRoom

  @registry PartyGame.Game.Registry

  @supervisor PartyGame.Game.Supervisor

  @fifteen_minute_timeout 900_000

  @five_minutes_in_ms 300_000

  def start(%GameRoom{} = game) do
    opts = [
      game: game,
      name: {:via, Registry, {@registry, game.room_name}}
    ]

    DynamicSupervisor.start_child(@supervisor, {__MODULE__, opts})
  end

  def stop(room_name) do
    case lookup(room_name) do
      {:ok, pid} -> DynamicSupervisor.terminate_child(@supervisor, pid)
      _ -> :ok
    end
  end

  def lookup(room_name) do
    case Registry.lookup(@registry, room_name) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, %{room_name: "Room name is not found."}}
    end
  end

  def start_link(opts) do
    {name, opts} = Keyword.pop(opts, :name)
    {game, _} = Keyword.pop(opts, :game)

    GenServer.start_link(__MODULE__, game, name: name)
  end

  def get_game(room_name) do
    GenServer.call(via_tuple(room_name), :game)
  end

  def update_game(%GameRoom{} = game) do
    GenServer.call(via_tuple(game.room_name), {:update, game})
  end

  def update_game(room_name, %GameRoom{} = game) do
    GenServer.call(via_tuple(room_name), {:update, game})
  end

  def ping(room_name) do
    GenServer.call(via_tuple(room_name), :ping)
  end

  def room_name() do
    rand = random_string(room_name_length())

    case lookup(rand) do
      {:ok, _} -> room_name()
      {:error, _} -> rand
    end
  end

  defp room_name_length() do
    %{workers: worker_count} = DynamicSupervisor.count_children(PartyGame.Game.Supervisor)

    case worker_count do
      n when n < 5 -> 1
      n when n >= 5 and n < 10 -> 2
      n when n >= 10 and n < 100 -> 3
      n when n >= 100 and n < 500 -> 4
      n when n >= 500 and n < 1000 -> 5
      _ -> 6
    end
  end

  defp random_string(length) do
    :crypto.strong_rand_bytes(length) |> Base.encode32() |> binary_part(0, length)
  end

  @impl true
  def init(state) do
    {:ok, {state, :active}, @fifteen_minute_timeout}
  end

  # Server (callbacks)
  @impl true
  def handle_call({:update, %GameRoom{} = game}, _from, _game) do
    {:reply, game, {game, :active}, @fifteen_minute_timeout}
  end

  @impl true
  def handle_call(:game, _from, {game, _status}) do
    {:reply, game, {game, :active}, @fifteen_minute_timeout}
  end

  @impl true
  def handle_call(:ping, _from, {game, _status}) do
    {:reply, :ok, {game, :active}, @fifteen_minute_timeout}
  end

  @impl true
  def handle_info(:timeout, {game, :active}) do
    lobby = PartyGameWeb.LobbyChannel.channel_name()
    IO.inspect("Timeout")

    PartyGameWeb.Endpoint.broadcast!(
      "#{lobby}#{game.room_name}",
      "handle_game_server_message",
      %{
        action: "idle_timeout",
        title: "Game inactive",
        message: "Game will restart in #{trunc(@five_minutes_in_ms / 60 / 1000)} minutes."
      }
    )

    {:noreply, {game, :pending_shutdown}, @five_minutes_in_ms}
  end

  @impl true
  def handle_info(:timeout, {game, :pending_shutdown}) do
    lobby = PartyGameWeb.LobbyChannel.channel_name()

    PartyGameWeb.Endpoint.broadcast!(
      "#{lobby}#{game.room_name}",
      "handle_game_server_message",
      %{
        action: "shutdown",
        title: "Game Over",
        message: "Inactive Too Long"
      }
    )

    {:stop, :normal, game}
  end

  defp via_tuple(name) do
    {:via, Registry, {@registry, name}}
  end
end
