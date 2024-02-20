defmodule HelloWeb.ChannelCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      import Phoenix.ChannelTest
      import PartyGameWeb.ChannelCase

      # The default endpoint for testing
      @endpoint HelloWeb.Endpoint
    end
  end

  setup _tags do
    PartyGameWeb.DataCase.setup_sandbox(tags)
    :ok
  end
end
