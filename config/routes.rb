Rails.application.routes.draw do
  get 'loaders/index'
  devise_for :users
  root 'home#index'
  get 'todos/index'
  get 'about/index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  if Rails.application.config.lookbook_enabled 
    mount Lookbook::Engine, at: "/dev/lookbook"
  end
end
