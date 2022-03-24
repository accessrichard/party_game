defmodule PartyGame.ChannelWatcher do
  @moduledoc """
  When a user leaves a game we need a mechanism to notify other users.any()

  intercepting presence_diff out messages is too noisy as a game room of 25
  players would run handle_out 25 times in a row.

  e.g.
  intercept ["presence_diff"]

  @impl true
  def handle_out("presence_diff", diff, socket)

  Using a genserver to monitor the channel process exit to notify users
  of players leaving.

  https://stackoverflow.com/questions/33934029/how-to-detect-if-a-user-left-a-phoenix-channel-due-to-a-network-disconnect
  https://gist.github.com/sb8244/1cf35403186613462f28f2cb5906e06f
  """
  use GenServer

  @name __MODULE__



  ## Client API

  def monitor(pid, mfa) do
    GenServer.call(@name, {:monitor, pid, mfa})
  end

  def demonitor(pid) do
    GenServer.call(@name, {:demonitor, pid})
  end

  ## Server API

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: @name)
  end

  def init(_) do
    Process.flag(:trap_exit, true)
    {:ok, %{channels: Map.new()}}
  end

  def handle_call({:monitor, pid, mfa}, _from, state) do
    Process.link(pid)
    {:reply, :ok, put_channel(state, pid, mfa)}
  end

  def handle_call({:demonitor, pid}, _from, state) do
    case Map.fetch(state.channels, pid) do
      :error ->
        {:reply, :ok, state}

      {:ok, _mfa} ->
        Process.unlink(pid)
        {:reply, :ok, drop_channel(state, pid)}
    end
  end

  def handle_info({:EXIT, pid, _reason}, state) do
    case Map.fetch(state.channels, pid) do
      :error ->
        {:noreply, state}

      {:ok, {mod, func, args}} ->
        Task.start_link(fn -> apply(mod, func, args) end)
        {:noreply, drop_channel(state, pid)}
    end
  end

  defp drop_channel(state, pid) do
    %{state | channels: Map.delete(state.channels, pid)}
  end

  defp put_channel(state, pid, mfa) do
    %{state | channels: Map.put(state.channels, pid, mfa)}
  end
end
