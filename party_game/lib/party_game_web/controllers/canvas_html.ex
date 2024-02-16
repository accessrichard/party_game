defmodule PartyGameWeb.CanvasHTML do
  use PartyGameWeb, :html

  def controls(assigns) do
    ~H"""
    <div class="button-group">
        <button id="clear" class="btn" type="button">Clear</button>
        <button id="save" class="btn" type="button">Save</button>
    </div>
    """
  end

  def color_buttons(assigns) do
    ~H"""
    <div class="flex flex-row">
      <button class="color-button color-button-size black light-text active">Black</button>
      <button class="color-button color-button-size gray light-text">Gray</button>
      <button class="color-button color-button-size red light-text">Red</button>
      <button class="color-button color-button-size orange light-text">Orange</button>
      <button class="color-button color-button-size yellow dark-text">Yellow</button>
      <button class="color-button color-button-size green light-text">Green</button>
      <button class="color-button color-button-size blue light-text">Blue</button>
      <button class="color-button color-button-size purple light-text">Purple</button>
      <.controls/>
      </div>
    """
  end

  def render(_, assigns) do
    ~H"""
    <h2>Drawing<span id="word"></span></h2>
    <span id="timer">00:00:00</span>
    <div id="canvas-overlay"><div id="visible-area">Visible Area</div></div>
    <canvas id="paint-canvas"></canvas>
    <div class="nav-bar">
      <.color_buttons/>
    </div>

    """
  end
end
