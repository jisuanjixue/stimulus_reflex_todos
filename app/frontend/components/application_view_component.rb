class ApplicationViewComponent < ViewComponentReflex::Component
    include ViewComponentContrib::WrappedHelper
    # include ActionPolicy::Behaviour
    include Dry::Effects.Reader(:current_user, default: nil)
    include ApplicationHelper
    extend Dry::Initializer
    extend Dry.Types()

    class ApplicationReflex < ViewComponentReflex::Reflex
      delegate :current_user, to: :connection     
    end

    ApplicationViewComponent.reflex_base_class = ApplicationReflex
  
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
