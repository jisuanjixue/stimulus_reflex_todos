module ApplicationHelper
    def component(name, *args, **kwargs, &block)
        component = name.to_s.camelize.constantize::Component
        params =  component.new(*args, **kwargs)
        render(params, &block)
    end
end
