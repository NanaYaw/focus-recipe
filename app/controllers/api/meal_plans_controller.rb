module Api
    class MealPlansController < ApplicationController
      protect_from_forgery with: :null_session
      

      def index
      end

      def show
      end

      def update_serving
        @meal_plan = MealPlan.joins(plan: [recipes: :ingredients]).find_by({plan_id: meal_plan_params[:plan_id], meal_type: meal_plan_params[:meal_type], day: params[:day]})

        @meal_plan.number_of_persons_to_be_served = @meal_plan.number_of_persons_to_be_served + 1

        if @meal_plan.save!
          Turbo::StreamsChannel.broadcast_replace_to :servings, target: "servings",
            partial: "users/recipes/serving",
            locals: {serving: @meal_plan.number_of_persons_to_be_served}

          @meal_plan.recipe.ingredients.map do |t|
            quantity = IngredientQuantityCalculator.new(qty = t.quantity, serving = @meal_plan.number_of_persons_to_be_served.to_i).call

            Turbo::StreamsChannel.broadcast_replace_to :servings, target: "quantity-#{t.id}",
              partial: "users/recipes/ingredient_quantity",
              locals: {quantity: quantity, id: t.id}
          end
        end
      end

      def delete_serving
        @meal_plan = MealPlan.find_by({plan_id: meal_plan_params[:plan_id], meal_type: meal_plan_params[:meal_type], day: params[:day]})

        if @meal_plan.number_of_persons_to_be_served > 1
          @meal_plan.number_of_persons_to_be_served = @meal_plan.number_of_persons_to_be_served - 1

          if @meal_plan.save!
            Turbo::StreamsChannel.broadcast_replace_to :servings, target: "servings",
              partial: "users/recipes/serving",
              locals: {serving: @meal_plan.number_of_persons_to_be_served}

            @meal_plan.recipe.ingredients.map do |t|
              quantity = IngredientQuantityCalculator.new(qty = t.quantity, serving = @meal_plan.number_of_persons_to_be_served.to_f).call

              Turbo::StreamsChannel.broadcast_replace_to :servings, target: "quantity-#{t.id}",
                partial: "users/recipes/ingredient_quantity",
                locals: {quantity: quantity, id: t.id}
            end
          end
        end
      end
    end
end