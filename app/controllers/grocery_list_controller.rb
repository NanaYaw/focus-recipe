class GroceryListController < ApplicationController

    def index
    end
    
    def show
        plan = Plan.find(3)

        meal_plans_service = NormalizerService.new(params['id'])
        meal_plans_service.call
     
        recipes = meal_plans_service.recipe_ids
        @groceries = GroceryShoppingListService.new(recipes).grocery_list
        
        @meal_plans = meal_plans_service.grid_normalizer
                recipe_ids = meal_plans_service.recipe_ids
                @reviews_avg = Review.where(recipe_id: recipe_ids).group(:recipe_id).average(:stars).transform_values { |v| v&.round(1) || 0.0 }
                @mealplan_sums = MealPlan.where(recipe_id: recipe_ids).unscope(:order).group(:recipe_id).sum(:number_of_persons_to_be_served)
                @meal_plans.each do |_, days|
                    days.each do |_, meal_plan|
                        next if meal_plan.blank? || meal_plan.recipe.blank?
                        meal_plan.recipe.precompute_average_stars(@reviews_avg[meal_plan.recipe.id] || 0.0)
                        meal_plan.recipe.precompute_mealplan_sum(@mealplan_sums[meal_plan.recipe.id] || 0)
                    end
                end

            
        
        respond_to do |format|
            format.html
            
            format.pdf do
                render pdf: plan.plan_name.tr(" ", "-"),
                title: plan.plan_name,
                template: "plans/print_pdf",
                disposition: "inline",
                formats: [:html],
                layout: "pdf",
                dpi: 400
            end
        end
    end

    
end