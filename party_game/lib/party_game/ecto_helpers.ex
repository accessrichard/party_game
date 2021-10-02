defmodule PartyGame.EctoHelpers do

  def create_embedded_changeset(params, key, data, fun) do
    case Map.has_key?(params, key) do
      true -> for item <- Map.get(params, key, []), do: fun.(data, item)
      false -> []
    end
  end

  def require_field(changeset, key) do
    case Map.has_key?(changeset.data, key) do
      false -> Ecto.Changeset.add_error(changeset, key, "can't be blank")
      true -> changeset
    end
  end

  def format_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end

end
