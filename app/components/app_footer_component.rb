# frozen_string_literal: true

class AppFooterComponent < ViewComponentReflex::Component
  def initialize(class: nil)
    @class = binding.local_variable_get(:class)
    super
  end
end
