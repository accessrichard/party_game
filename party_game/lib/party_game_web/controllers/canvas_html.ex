defmodule PartyGameWeb.CanvasHTML do
  use PartyGameWeb, :html

  def controls(assigns) do
    ~H"""
      <button id="start" class="btn" type="button">Start</button>
      <button id="next" class="btn" type="button">Next</button>
      <button id="back" class="btn" type="button">Back</button>
      <button id="clear" class="btn" type="button">Clear</button>
      <button id="save" class="btn" type="button">Save</button>
    """
  end

  def color_buttons(assigns) do
    ~H"""
    <div class="container">
      <div>
      <span id="timer">00:00:00</span>
      </div>
      <div class="break"></div>
      <div>
          <button class="color-button color-button-size black light-text active">Black</button>
          <button class="color-button color-button-size gray light-text">Gray</button>
          <button class="color-button color-button-size red light-text">Red</button>
          <button class="color-button color-button-size orange light-text">Orange</button>
          <button class="color-button color-button-size yellow dark-text">Yellow</button>
          <button class="color-button color-button-size green light-text">Green</button>
          <button class="color-button color-button-size blue light-text">Blue</button>
          <button class="color-button color-button-size purple light-text">Purple</button>
        </div>
      <div class="break"></div>
      <div>
        <.controls/>
      </div>
      </div>
    """
  end

  def render(_, assigns) do
    ~H"""
    <div class="container">
    <h2 id="word-game"></h2>
    </div>
    <div id="canvas-overlay"><div id="visible-area">Visible Area</div></div>
    <canvas id="paint-canvas"></canvas>
      <.color_buttons/>

    """
  end
end
