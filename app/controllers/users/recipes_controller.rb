class Users::RecipesController < ApplicationController
    # before_action :authenticate_user!, except: [:index, :show]

    before_action :set_recipe
    before_action :set_review

    def index
        @pagy, @recipes = pagy(Recipe.includes(image_attachment: :blob).order(created_at: :DESC))
    end
    
    def show
        @recipe_ingredients = {}

        meal_plan = MealPlan.where(id: params[:meal_plan_id]).includes(:plan, [recipe: [:ingredients, image_attachment: :blob]])

        @favorite = Favorite.find_by(current_user)
        
        meal_plan.each do |t|
          t.recipe.ingredients.each do |ingredient|
           
            quantity = IngredientQuantityCalculator.new(qty = ingredient.quantity, serving = t.number_of_persons_to_be_served).call
           
            @recipe_ingredients[ingredient.id] = {
              :id => ingredient.id, 
              :quantity => quantity, 
              :recipe_id => t.recipe.id, 
              :mesurement_unit => ingredient.measurement_unit.name,
              :ingredient_state => ingredient.ingredient_state.name,
              :grocery => ingredient.grocery.name
            }
          end
        end

    end

    def single
    end


    def single_post
      
      render(partial: "users/recipes/single_recipe")
    end


private
    # Use callbacks to share common setup or constraints between actions.
    def set_recipe
      @recipe = Recipe.where(id: params[:id]).includes(:reviews,:ingredients, :favorites, image_attachment: [:blob], plans: [:meal_plans])[0]

    end

    def set_review
      @reviews = Review.where(recipe_id: params[:id])
    end
end