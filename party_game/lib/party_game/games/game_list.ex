defmodule PartyGame.Games.GameList do
  alias PartyGame.Games.MultipleChoice
  alias PartyGame.Game.GameMetaData
  alias PartyGame.Games.CanvasDraw

  def list() do
    games = [
      %GameMetaData{
        name: "Basic Math",
        category: "Math",
        type: "multi_choice",
        location: "server",
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Addition",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "addition"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Subtraction",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "subtraction"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "multiplication"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_multiply"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "division"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division - Fractions",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "fraction_divide"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Equations",
        category: "Math",
        type: "multi_choice",
        location: "server",
        options: %{type: "equation"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "U.S. State Capitals",
        category: "United States",
        type: "multi_choice",
        location: "server",
        module: MultipleChoice.States
      },
      %GameMetaData{
        name: "Draw Togather",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas",
        options: %{type: "draw_togather"},
        module: CanvasDraw.CanvasGame
      },
      %GameMetaData{
        name: "Guess The Drawing",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas",
        options: %{type: "guessing_game"},
        module: CanvasDraw.CanvasGame
      },
      %GameMetaData{
        name: "Alternating Draw Togather",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas",
        options: %{type: "alternate_draw"},
        module: CanvasDraw.CanvasGame
      },
      %GameMetaData{
        name: "Free Draw Togather",
        category: "Drawing",
        type: "canvas",
        location: "server",
        url: "/canvas",
        options: %{type: "free_draw"},
        module: CanvasDraw.CanvasGame
      },
      %GameMetaData{
        name: "",
        category: "User Games",
        type: "custom",
        location: "client",
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
          category: x.category
        }
      end)
  end

  def cached_game_list() do
    {_, games} =
      Cachex.fetch(
        :party_game_cache,
        "game_list",
        fn _ ->
          list()
          |> non_blank_game_list
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
