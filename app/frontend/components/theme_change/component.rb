# frozen_string_literal: true

class ThemeChange::Component < ApplicationViewComponent
  def initialize
    @theme_value = "light"
  end

  def set_theme
    @theme_value = element.dataset[:value]
  end

  def themes
    [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ]
  end

  def hand_theme
    document.documentElement.setAttribute("data-theme", @theme_value)
    window.localStorage.setItem("theme", @theme_value)
  end
end
