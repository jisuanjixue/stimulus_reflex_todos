class ApplicationViewComponentPreview < ViewComponentContrib::Preview::Base
  # Hides this class from previews index
  self.abstract_class = true

  # Layouts are inherited (but can be overriden)
  layout "component_preview"

  send :include, Dry::Effects.State(:current_user)

  def with_current_user(user)
    self.current_user = user

    block_given? ? yield : nil
  end
end
