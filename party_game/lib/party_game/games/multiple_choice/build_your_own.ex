defmodule PartyGame.Games.MultipleChoice.BuildYourOwn do
  def new(game_info, _) do
    game_info.game_room.game.questions
  end
end
