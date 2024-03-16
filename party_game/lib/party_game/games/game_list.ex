defmodule PartyGame.Games.GameList do
  alias PartyGame.Games.MultipleChoice
  alias PartyGame.Game.GameMetaData
  alias PartyGame.Games.Canvas

  def list() do
    games = [
      %GameMetaData{
        name: "Basic Math",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Addition",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "addition", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Subtraction",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "subtraction", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "multiplication", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_multiply", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "division", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_divide", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Equations",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "equation", settingsSlug: "mc"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "U.S. State Capitals",
        category: "United States",
        type: "multi_choice",
        location: "server",
        options: %{settingsSlug: "mc"},
        module: MultipleChoice.States
      },
      %GameMetaData{
        name: "Guess The Drawing",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas",
        options: %{settingsSlug: "canvas"},
        module: Canvas.CanvasGame
      },
      %GameMetaData{
        name: "Alternating Draw Togather",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas_alternate",
        options: %{settingsSlug: "canvas"},
        module: Canvas.CanvasGame
      },
      %GameMetaData{
        name: "",
        category: "User Games",
        type: "custom",
        location: "client",
        options: %{settingsSlug: "mc"},
        module: MultipleChoice.BuildYourOwn
      }
    ]

    games ++
      Enum.map(MultipleChoice.BuildYourOwnPrebuilt.prebuilt_games(), fn x ->
        %GameMetaData{
          name: x.name,
          module: MultipleChoice.BuildYourOwnPrebuilt,
          type: "multi_choice",
          location: "server",
          options: %{settingsSlug: "mc"},
          category: x.category
        }
      end)
  end

  def non_blank_cached_list() do
    cached_game_list() |> non_blank_game_list()
  end

  def cached_game_list() do
    {_, games} =
      Cachex.fetch(
        :party_game_cache,
        "game_list",
        fn _ ->
          list()
          |> sort_game_list
        end,
        ttl: :timer.minutes(5)
      )
    games
  end

  defp non_blank_game_list(game_list) do
    Enum.filter(game_list, &(&1.name !== ""))
  end

  defp sort_game_list(game_list) do
    Enum.sort(game_list, &(&1.category > &2.category))
  end

end
