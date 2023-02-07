module ApplicationHelper
    def component(name, *args, **kwargs, &block)
        component = name.to_s.camelize.constantize::Component
        params =  component.new(*args, **kwargs)
        render(params, &block)
    end

    # def method_missing(method_name, *args, **kwargs, &block)
    #     if method_name.end_with? "_component"
    #       component_class = method_name.to_s.classify.constantize
    #       component = component_class.new(*args, **kwargs)
    #       component.render_in(self, &block)
    #     else
    #       super(*args, *kwargs, &block)
    #     end
    #   end
end
