Rails.application.routes.draw do
  # Devise routes for users and admins
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

  
  # Admin Routes
  devise_scope :admin do
    authenticated :admin do
      scope module: :admins do
        # Dashboard and admin management
        get "dashboard", to: "dashboard#index", as: :authenticated_root
        resources :admins, except: [:create, :new]
        
        # Resources management
        resources :ingredient_states
        resources :measurement_units
        resources :groceries
        resources :grocery_categories
        resources :ingredients

        # Recipes management
        resources :recipes do
          collection do
            get :new_title
            post :create_title
            get :edit_title
          end

          member do
            patch :update_title
            patch :create_ingredient
            get :new_ingredient
            patch :edit_ingredient
            get :delete_ingredient
            patch :create_directions
            get :edit_direction
            patch :update_direction
            patch :delete_direction
          end
        end
      end
    end
  end

  # User Routes
  devise_scope :user do
    authenticated :user do
      # API Routes
      namespace :api do
        resources :lazyloads, only: [:index], controller: "lazy_loads"
        resources :mealplans, only: [:update, :show, :index], controller: "meal_plans"

        
        resources :plans, only: [] do
          collection do
            patch :meal_update, to: "v1/users/plans#meal_update"
            get :meal_plans_content, to: "v1/users/plans#meal_plans_content"
          end
        end
        
      end

      # User-specific routes
      namespace :users do
        get "plans", to: "plans#index", as: :authenticated_root
      end

      scope module: :users do
        resources :meal_plans

        resources :plans do
          collection do
            get "meal-plans"
            get "meal-plans-content"
            get "lazy-update"
            patch :meal_update
          end
          
          get "recipes/:id/meal_plan/:meal_plan_id", to: "recipes#show", as: "recipe", on: :collection
        end

        resources :groceries, only: [:index, :show], controller: "grocery_list"
        resources :recipes, only: [:show, :index, :single] do
          resources :favorites, only: [:create, :destroy]
          resources :reviews, only: [:create, :update] do
            member do
              patch "new"
              post "new"
            end

            collection do
              post "reply"
              patch "reply"
              patch "update_rating"
            end
          end
        end
        end
      
    end

    # Additional user routes
    scope module: :users do
      get "recipes/single/:id", to: "recipes#single", as: :single_recipes
      get "recipes/single_post/:id", to: "recipes#single_post", as: :single_post_recipes
      resources :profiles, only: [:update, :edit, :show]
    end
  end

  # Additional Routes
  get "test", to: "home#testmailer"

  # Root path
  root "home#index"
end
