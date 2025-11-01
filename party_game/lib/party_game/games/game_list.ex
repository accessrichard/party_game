defmodule PartyGame.Games.GameList do
  alias PartyGame.Games.MultipleChoice
  alias PartyGame.Game.GameMetaData
  alias PartyGame.Games.Canvas
  alias PartyGame.Games.Hangman

  def list() do
    games = [
      %GameMetaData{
        name: "Basic Math",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: ""},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Addition",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "addition"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Subtraction",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "subtraction"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "multiplication"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Multiplication - Fractions",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "fraction_multiply"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "division"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Division - Fractions",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        settings: true,
        import: true,
        create: true,
        location: "server",
        options: %{type: "fraction_divide"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "Equations",
        category: "Math",
        type: "multiple_choice",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        options: %{type: "equation"},
        module: MultipleChoice.BasicMath
      },
      %GameMetaData{
        name: "U.S. State Capitals",
        category: "United States",
        url: "/multiple_choice",
        location: "server",
        settings: true,
        import: true,
        create: true,
        module: MultipleChoice.States
      },
      %GameMetaData{
        name: "Guess The Drawing",
        category: "Drawing",
        type: "canvas",
        url: "/canvas",
        settings: true,
        import: true,
        create: true,
        location: "server",
        module: Canvas.CanvasGame
      },
      %GameMetaData{
        name: "Alternating Draw Togather",
        category: "Drawing",
        type: "canvas_alternate",
        url: "/canvas_alternate",
        location: "server",
        settings: true,
        import: true,
        create: true,
        module: Canvas.CanvasGame
      },
      %GameMetaData{
        name: "Hangman",
        category: "Hangman",
        type: "hangman",
        url: "/hangman",
        settings: true,
        import: true,
        create: true,
        location: "server",
        module: Hangman.HangmanGame
      },
      %GameMetaData{
        name: "",
        category: "User Games",
        type: "multiple_choice",
        location: "client",
        module: MultipleChoice.BuildYourOwn
      }
    ]

    games ++
      Enum.map(MultipleChoice.BuildYourOwnPrebuilt.prebuilt_games(), fn x ->
        %GameMetaData{
          name: x.name,
          module: MultipleChoice.BuildYourOwnPrebuilt,
          type: "multiple_choice",
          location: "server",
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
