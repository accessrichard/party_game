defmodule PartyGame.Server do
  use GenServer, restart: :transient
  alias PartyGame.Game.Game
  alias PartyGame.GameRoom

  @registry PartyGame.Game.Registry

  @supervisor PartyGame.Game.Supervisor

  @timeout 600_000

  def start(%Game{} = game) do
    opts = [
      game: game,
      name: {:via, Registry, {@registry, game.room_name}}
    ]

    DynamicSupervisor.start_child(@supervisor, {__MODULE__, opts})
  end

  def stop(room_name) do
    with {:ok, pid} <- lookup(room_name) do
      :ok = DynamicSupervisor.terminate_child(@supervisor, pid)
    else
      {:error, reason} -> {:error, reason}
    end
  end

  def lookup(room_name) do
    case Registry.lookup(@registry, room_name) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, "Room name is not found."}
    end
  end

  def start_link(opts) do
    {name, opts} = Keyword.pop(opts, :name)
    {game, _} = Keyword.pop(opts, :game)

    GenServer.start_link(__MODULE__, game, name: name)
  end

  @impl true
  def init(state) do
    {:ok, state, @timeout}
  end

  def get_game(room_name) do
    GenServer.call(via_tuple(room_name), :game)
  end

  def update_game(%Game{} = game) do
    GenServer.call(via_tuple(game.room_name), {:update, game})
  end

  def update_game(room_name, %Game{} = game) do
    GenServer.call(via_tuple(room_name), {:update, game})
  end

  def buzz(room_name, player_name, answer) do
    GenServer.call(via_tuple(room_name), {:buzz, player_name, answer})
  end

  def room_name() do
    rand = random_string(6)

    case lookup(rand) do
      {:ok, _} -> room_name()
      {:error, _} -> rand
    end
  end

  defp random_string(length) do
    :crypto.strong_rand_bytes(length) |> Base.encode32() |> binary_part(0, length)
  end

  # Server (callbacks)
  @impl true
  def handle_call({:update, %Game{} = game}, _from, _game) do
    {:reply, game, game, @timeout}
  end

  @impl true
  def handle_call(:game, _from, game) do
    {:reply, game, game, @timeout}
  end

  @impl true
  def handle_call({:buzz, name, answer}, _from, game) do
    with {:win, game} <- GameRoom.buzz(game, name, answer) do
      {:reply, {:win, game}, game, @timeout}
    else
      {:lose, game} -> {:reply, {:lose, game}, game, @timeout}
    end
  end

  @impl true
  def handle_info(:timeout, game) do
    {:stop, :normal, game}
  end

  defp via_tuple(name) do
    {:via, Registry, {@registry, name}}
  end
end
