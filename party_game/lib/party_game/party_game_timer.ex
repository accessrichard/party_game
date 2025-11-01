defmodule PartyGame.PartyGameTimer do
  @moduledoc """
  A timer for the party games.
  """
  use GenServer

  @name __MODULE__

  ## Client API

  @doc """
  key = unique key of the timer
  time = time in ms
  mfa = Module Function and Args to call once timer is completed
  """
  def start_timer(key, time, mfa) do
    GenServer.call(@name, {:start_timer, key, time, mfa})
  end

  def cancel_timer(key) do
    GenServer.call(@name, {:cancel_timer, key})
  end

  ## Server API

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: @name)
  end

  def init(_) do
    {:ok, %{timers: Map.new()}}
  end

  def handle_call({:start_timer, key, time, mfa}, _from, state) do
    if Map.get(state.timers, key) != nil do
      cancel(state, key)
    end

    timer = Process.send_after(self(), {:timer_completed, key, mfa}, time)
    new_state = put_timer(state, key, mfa, timer)
    {:reply, {:ok, DateTime.utc_now()}, new_state}
  end

  def handle_call({:cancel_timer, key}, _from, state) do
    cancel(state, key)
  end

  defp cancel(state, key) do
    case Map.fetch(state.timers, key) do
      :error ->
        {:reply, :ok, state}

      {:ok, mfa} ->
        Process.cancel_timer(mfa.ref)
        {:reply, :ok, drop_timer(state, key)}
    end
  end

  def handle_info({:timer_completed, key, _}, state) do
    case Map.fetch(state.timers, key) do
      :error ->
        {:noreply, state}

      {:ok, mfa} ->
        IO.inspect({mfa}, label: "Timer Completed")
        {:noreply, drop_timer(state, key)}
    end
  end

  defp drop_timer(state, key) do
    %{state | timers: Map.delete(state.timers, key)}
  end

  defp put_timer(state, key, mfa, timer) do
    %{state | timers: Map.put(state.timers, key, Map.put(mfa, :ref, timer))}
  end
end
