class ApplicationViewComponentPreview < ViewComponentContrib::Preview::Base
  # Hides this class from previews index
  self.abstract_class = true

  # Layouts are inherited (but can be overriden)
  layout "component_preview"
end
