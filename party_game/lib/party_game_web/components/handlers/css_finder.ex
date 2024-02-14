defmodule PartyGameWeb.Handlers.CssFinder do
require Logger

  def get_react_build_css() do
    assets_dir = "#{:code.priv_dir(:party_game)}/static/assets"
    css = File.ls!(assets_dir)
    |> Enum.filter(&(String.starts_with?(&1, "index-") and Path.extname(&1) === ".css"))
    |> Enum.map(&{&1, File.stat!(Path.join(assets_dir, &1)).ctime})
    |> Enum.sort(fn {_, time1}, {_, time2} -> time2 <= time1 end)

    [{file, _} | _] = css

    Logger.info("Using CSS: /assets/#{file}. If not loading correctly, 'npm run build' from UI solution.")

    "/assets/#{file}"
  end
end
