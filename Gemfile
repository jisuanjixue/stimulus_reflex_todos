source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.0"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.0.4"

# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem "propshaft"

# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", "~> 5.0"

# Bundle and transpile JavaScript [https://github.com/rails/jsbundling-rails]
gem "jsbundling-rails"

# A framework for building reusable, testable & encapsulated view components in Ruby on Rails. (https://viewcomponent.org)
gem 'view_component', '~> 2.82'

# ViewComponentReflex allows you to write reflexes right in your view component code.
gem "view_component_reflex", "3.3.0"
# A new way to craft modern, reactive web interfaces with Ruby on Rails.
gem "stimulus_reflex", "~> 3.5.0.rc2"
# A collection of extension and developer tools for ViewComponent
gem "view_component-contrib"
#DSL for declaring params and options of the initializer
gem 'dry-initializer', '~> 3.1', '>= 3.1.1'
#Algebraic effects
gem 'dry-effects', '~> 0.4.0'
#class attrublies data type
gem 'dry-types', '~> 1.7.0'
# devise
gem 'devise'
# Semantic Logger is a feature rich logging framework, and replacement for existing Ruby & Rails loggers.
gem "amazing_print"
gem "rails_semantic_logger"

# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
# gem "turbo-rails"

# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
# gem "stimulus-rails"

# Bundle and process CSS [https://github.com/rails/cssbundling-rails]
gem "cssbundling-rails"

# Use Redis adapter to run Action Cable in production
gem "redis", ">= 4.0", :require => ["redis", "redis/connection/hiredis"]
# for redis
gem 'hiredis'
#Looking for Lookbook to view_component
gem "lookbook", require: false

# Redis session
gem "redis-session-store", "~> 0.11.3"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

group :development, :test do

  # Automatic Ruby code style checking tool. (https://github.com/rubocop/rubocop)
  gem 'rubocop', require: false
  gem 'rubocop-stimulus_reflex'
  gem 'rubocop-cable_ready'
    # Automatic performance checking tool for Ruby code. (https://github.com/rubocop/rubocop-performance)
  gem 'rubocop-performance', require: false

  # Code style checking for RSpec files (https://github.com/rubocop/rubocop-rspec)
  gem 'rubocop-rspec', require: false

  # Automatic Rails code style checking tool. (https://github.com/rubocop/rubocop-rails)
  gem 'rubocop-rails', require: false

# lint erb file
  gem 'erb_lint', require: false
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
end

group :development do
  gem "annotate", "~> 3.2.0"
   gem "better_errors"
  gem "binding_of_caller"
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end


gem "cable_ready", "~> 5.0.pre10"

# gem "activerecord-session_store", "~> 2.0"

# gem "devise-jwt", "~> 0.10.0"

gem "action_policy", "~> 0.6.4"

gem "futurism", "~> 1.1"

gem "noticed", "~> 1.6"
