class Users::RecipesController < ApplicationController
    before_action :set_recipe
    before_action :set_review

    def index
        @pagy, @recipes = pagy(Recipe.all.order(created_at: :DESC))
    end
    
    def show
        # recipe_ingredients = Ingredient.includes(:grocery, :measurement_unit, :ingredient_state, recipe: [:plans, :favorites, :meal_plans] ).where(recipe_id: params[:id]).order("id ASC")

        @recipe_ingredients = {}

        meal_plan = MealPlan.includes(:plan).joins(recipe: :ingredients).where(id: params[:meal_plan_id])
        
        meal_plan.each do |t|
          # ingredients = t.recipe.ingredients.select{|s| s.recipe_id == t.recipe.id}

          

          
          t.recipe.ingredients.each do |ingredient|
           
            quantity = IngredientQuantityCalculator.new(qty = ingredient.quantity, serving = t.number_of_persons_to_be_served).call
            # # quantity = IngredientQuantityCalculator.new(qty = t.quantity, serving = 1).call
            # p "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
            # p quantity
            # p "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" 
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


private
    # Use callbacks to share common setup or constraints between actions.
    def set_recipe
      @recipe = Recipe.where(id: params[:id]).includes(:ingredients, :favorites)[0]
    end

    def set_review
      @reviews = Review.where(recipe_id: params[:id])
    end
end