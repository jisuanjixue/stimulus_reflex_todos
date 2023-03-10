require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "action_controller/railtie"
require "action_cable/engine"
require "active_job/railtie"
require "active_model/railtie"
require "active_record/railtie"
require "active_storage/engine"
# require "action_mailer/railtie"
# require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
# require "rails/test_unit/railtie"
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.

Bundler.require(*Rails.groups)

module StimulusReflexTodo
  class Application < Rails::Application
    config.autoload_paths << Rails.root.join("app", "frontend", "components")
    config.view_component.preview_paths << Rails.root.join("app", "frontend", "components")
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.x.git.commit_version =
    ENV.fetch('COMMIT_VERSION') { `git describe --always`.chomp }

    config.generators.system_tests = nil
    config.view_component.instrumentation_enabled = false
    config.lookbook_enabled = ENV["LOOKBOOK_ENABLED"] == true || Rails.env.development? 
    require "lookbook" if config.lookbook_enabled
  end
end
