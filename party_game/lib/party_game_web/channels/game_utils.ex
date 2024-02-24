defmodule PartyGameWeb.GameUtils do

  def game_code(topic) do
    [_ | code] = String.split(topic, ":")
    [code] = code
    code
  end

end
