defmodule PartyGame.Game.Settings do

  use Ecto.Schema
  @primary_key false
  @derive {Jason.Encoder, only: [:question_time, :next_question_time, :wrong_answer_timeout, :rounds, :prompt_game_start]}
  schema "settings" do
    field(:question_time, :integer, default: 10)
    field(:next_question_time, :integer, default: 1)
    field(:wrong_answer_timeout, :integer, default: 1)
    field(:rounds, :integer, default: 10)
    field(:prompt_game_start, :boolean, default: true)
  end

  def apply_settings(settings, params \\ %{}) do
    settings
    |> Ecto.Changeset.cast(params, [:question_time, :next_question_time, :wrong_answer_timeout, :rounds, :prompt_game_start])
    |> Ecto.Changeset.apply_changes()
  end

  def new(fields \\ %{}), do: __struct__(fields)
end
