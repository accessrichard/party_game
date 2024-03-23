defmodule PartyGameWeb.HomeHTML do
  use PartyGameWeb, :html

  def render(_, assigns) do
    ~H"""
      <div class="text-align-center max-width app-blue app">
            <div class="flex-center app pd-5-lr full-width">
              <.logo/>
              <div>
                <div class="large-title slidein-right">Buzz Games</div>
                <div class="half-size-title text-align-right fade-in">By Buzztastic Games</div>
              </div>
              <p class="slidein-left">Create <a class="app-link" href="/start">New</a> or <a class="app-link" href="/join">Join Game</a>
              </p>
            </div>
            <.seo game_list={@game_list}/>
      </div>
    """
  end

  def slice(games, num_cols) do
    num_per_col = Float.ceil(length(games) / num_cols) |> round
    range = Enum.to_list(0..(num_cols - 1))

    Enum.map(range, fn i ->
      Enum.slice(games, i * num_per_col, num_per_col)
    end)
  end

  def seo(assigns) do
    ~H"""
      <div class='flex flex-row flex-center app-light pd-5-lr'>
        <div class='flex-column text-align-left flex-item pad-5pc'>
            Play Trivia Games!
            <span class='font-14px'>Play games alone or togather to see who can answer the quickest!
            </span>
            <ul class='font-14px'>
                <li>Learn to become proficient in Addition, Subtraction, Multiplication, Division and Equations.</li>
                <li>Play Sports Trivia Games</li>
                <li>Learn the United States Capitals!</li>
                <li>Learn about the Solar System!</li>
            </ul>
        </div>
        <div class='flex-column  flex-item pad-5pc'>
            <div class='flex-column  flex-item'>
              Play with friends or alone
            </div>
            <div class='flex-column  flex-item'>
              Create your own Trivia Game
            </div>
        </div>
        <div class='flex-column text-align-left flex-item pad-5pc'>
            Interactive Game Creator
            <span class='font-14px'>Make your own flashcards or game with our interactive Game creator. Create your game,
                download it to a text file, and whenever you want to play it again, open the file up and paste it in our
                import game section.</span>
        </div>
    </div>
    <div class='flex flex-row flex-center'>
        <div class='flex-column flex-item pad-5pc'>
            Start playing immediately!
            <span class='font-14px'>Just enter any name you want on the next screen and select your game.</span>
        </div>
    </div>
    <div class='flex flex-row flex-center app-light pad-5pc-top'>
        <div class='flex-column text-align-left flex-item pad-5pc-lr'>
            Trivia Questions and Games are added all the time.
            <span class='font-14px'>Here are the current trivia offerings:</span>
        </div>
    </div>
    <.game_list game_list={@game_list} />
    """
  end

  def game_list(assigns) do
    ~H"""
        <div class='flex flex-row flex-center app-light pad-5pc-lr pad-5pc-bottom'>
            <div :for={game_cols <- slice @game_list, 3} class='flex-column text-align-left flex-item pad-5pc-lr pad-5pc-bottom '>
              <ul class='font-14px' >
                  <li :for={game <- game_cols}>
                    <%= "#{game.category} - #{game.name}" %>
                  </li>
              </ul>
          </div>
      </div>
    """
  end
end
