Rails.application.routes.draw do
  devise_for :users, path: "users", controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords",
    confirmations: "users/confirmations"
  }

  devise_for :admins, path: "admins", controllers: {
    sessions: "admins/sessions",
    passwords: "admins/passwords",
    invitations: "admins/invitations"
  }

  namespace :api do
    resources :mealplans, only: [:update], controller: "meal_palns"
  end

  devise_scope :admin do
    authenticated :admin do

      scope module: :admins do
        get "dashboard" => "dashboard#index", :as => :authenticated_root
        resources :admins, except: [:create, :new]

        resources :ingredient_states
        resources :measurement_units
        resources :groceries
        resources :grocery_categories
        resources :ingredients

        resources :recipes do
          get :new_title, on: :collection
          post :create_title, on: :collection
          get :edit_title, on: :member # recipe/edit_title
          patch :update_title, on: :member # recipe/1/update_title

          # START recipe ingredient
          patch :create_ingredient, on: :collection
          get :new_ingredient, on: :member
          patch :edit_ingredient, on: :member
          get :delete_ingredient, on: :member

          # START recipe durections
          patch :create_directions, on: :collection
          get :edit_direction, on: :collection
          patch :update_direction, on: :collection
          patch :delete_direction, on: :collection
        end
      end
    end
  end

  # resources :reviews
  devise_scope :user do
    authenticated :user do
      namespace :users do
        get "plans" => "plans#index", :as => :authenticated_root
      end

      scope module: :users do
        resources :meal_plans do
          patch "number-of-persons-to-be-served" => "meal_plans#update_serving", :as => :create_serving, :on => :member
          delete "number-of-persons-to-be-served" => "meal_plans#delete_serving", :as => :delete_serving, :on => :member
        end

        

        resources :plans do
          get "meal-plans", on: :collection
          get "meal-plans-content", on: :collection
          get "lazy-update", on: :collection
          patch :meal_update, on: :collection

          
          get "recipes/:id/meal_plan/:meal_plan_id" => "recipes#show", :as => "recipe", :on => :collection
        end
          
        resources :groceries, only: [:index, :show], controller: "grocery_list"
        
        # get "grocery-list", on: :member, controller: "grocery_list"
        
        resources :recipes, only: [:show, :index, :single] do
          resources :favorites, only: [:create, :destroy]
          

          resources :reviews do
            patch "new", on: :member
            post "new", on: :member

            post "reply", on: :collection
            patch "reply", on: :collection

            patch "update_rating", on: :collection
          end
        end
      end
    end

    scope module: :users do
      get "recipes/single/:id" => "recipes#single", :as => :single_recipes
      get "recipes/single_post/:id" => "recipes#single_post", :as => :single_post_recipes

      resources :profiles, only: [:update, :edit, :show]
    end
  end

  # Defines the root path route ("/")
  get "test" => "home#testmailer"
  root "home#index"
end
