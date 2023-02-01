class ApplicationViewComponent < ViewComponentReflex::Component
  class ApplicationReflex < ViewComponentReflex::Reflex
  end
    ApplicationViewComponent.reflex_base_class = ApplicationReflex
    extend Dry::Initializer
    include ApplicationHelper

    class << self
     # To allow DB queries, put this in the class definition:
    # self.allow_db_queries = true
        attr_accessor :allow_db_queries
        alias_method :allow_db_queries?, :allow_db_queries
        def component_name
          @component_name ||= name.sub(/::Component$/, "").underscore
        end
      end
      
      def component(name, ...)
        return super unless name.starts_with?(".")
      
        full_name = self.class.component_name + name.sub('.', '/')
      
        super(full_name, ...)
    end
end
