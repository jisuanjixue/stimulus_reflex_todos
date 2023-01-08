# frozen_string_literal: true

class ExpoPageComponent < ViewComponentReflex::Component
  def initialize(title:, component:)
    @title = title
    @components = if component.is_a? Array
      component
    else
      [component]
    end
    @selected_component = @components.first
  end

  def component_class(component)
     if component == @selected_component
      'tab tab-active'
     else
      'tab'
     end
  end

  def select_component
    @selected_component = element.dataset[:component]
  end

end
