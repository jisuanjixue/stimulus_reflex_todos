ActiveSupport.on_load(:view_component) do
  # Extend your preview controller to support authentication and other
  # application-specific stuff
  #
  # Rails.application.config.to_prepare do
  #   ViewComponentsController.class_eval do
  #     include Authenticated
  #   end
  # end
  #
  # Make it possible to store previews in sidecar folders
  # See https://github.com/palkan/view_component-contrib#organizing-components-or-sidecar-pattern-extended
  ViewComponent::Preview.extend ViewComponentContrib::Preview::Sidecarable
  # Enable `self.abstract_class = true` to exclude previews from the list
  ViewComponent::Preview.extend ViewComponentContrib::Preview::Abstract

  if Rails.application.config.view_component.raise_on_db_queries
    ActiveSupport::Notifications.subscribe "sql.active_record" do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
  
      Thread.current[:last_sql_query] = event
    end
  
    ActiveSupport::Notifications.subscribe("!render.view_component") do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      last_sql_query = Thread.current[:last_sql_query]
      next unless last_sql_query
  
      if (event.time..event.end).cover?(last_sql_query.time)
        component = event.payload[:name].constantize
        next if component.allow_db_queries?
  
        raise <<~ERROR.squish
          `#{component.component_name}` component is not allowed to make database queries.
          Attempting to make the following query: #{last_sql_query.payload[:sql]}.
        ERROR
      end
    end
  end

  if Rails.application.config.lookbook_enabled
    Rails.application.config.to_prepare do
      Lookbook::PreviewsController.class_eval do
        include Dry::Effects::Handler.State(:current_user)

        around_action :nullify_current_user

        private

        def nullify_current_user
          with_current_user(nil) { yield }
        end
      end
    end
  end
end
