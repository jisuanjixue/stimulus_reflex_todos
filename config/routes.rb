Rails.application.routes.draw do
  root 'home#index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  if Rails.application.config.lookbook_enabled 
    mount LookBook::Engine, at: "/dev/lookbook"
  end
end
