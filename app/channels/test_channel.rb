class TestChannel < ApplicationCable::Channel
  def subscribed
    stream_from "test"
  end

  def unsubscribed
    puts data["message"]
    ActionCable.server.broadcast("test", "ActionCable is connected")
  end
end
