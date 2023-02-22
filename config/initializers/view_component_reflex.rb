ViewComponentReflex::Engine.configure do |config|
    config.state_adapter = ViewComponentReflex::StateAdapter::Redis.new(
        redis_opts: {
            url: "redis://localhost:6379/1", driver: :hiredis
        },
        ttl: 3600)
  end