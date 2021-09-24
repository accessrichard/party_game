defmodule PartyGameWeb.CreateView do
  use PartyGameWeb, :view
  alias PartyGame.EctoHelpers

  def render("error.json", %{changeset: changeset}) do
    errors = EctoHelpers.format_errors(changeset)
    %{errors: errors, isValid: false}
  end

  def render("success.json", %{isValid: isValid}) do
    %{isValid: isValid}
  end
end
