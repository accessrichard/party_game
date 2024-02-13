defmodule PartyGameWeb.CreateJSON do
  alias PartyGame.EctoHelpers

  def error(%{changeset: changeset}) do
    errors = EctoHelpers.format_errors(changeset)
    %{errors: errors, isValid: false}
  end

  def success(%{isValid: isValid}) do
    %{isValid: isValid}
  end
end
