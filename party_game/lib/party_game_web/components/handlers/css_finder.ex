defmodule PartyGameWeb.Handlers.CssFinder do

  def get_react_build_css() do
    css = File.ls!("#{:code.priv_dir(:party_game)}/static/assets")
    |> Enum.find(&(String.starts_with?(&1, "index-") and Path.extname(&1) === ".css"))

    "/assets/#{css}"
  end
end
