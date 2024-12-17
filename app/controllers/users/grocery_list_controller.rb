class Users::GroceryListController < ApplicationController

    def index
    end
    
    def show
        plan = Plan.find(3)

        meal_plans_service = NormalizerService.new(params['id'])
        meal_plans_service.call
     
        recipes = meal_plans_service.recipe_ids
        @groceries = GroceryShoppingList.new(recipes).grocery_list
        
        @meal_plans = meal_plans_service.grid_normalizer

            
        
        respond_to do |format|
            format.html
            
            format.pdf do
                render pdf: plan.plan_name.tr(" ", "-"),
                title: plan.plan_name,
                template: "users/plans/print_pdf",
                disposition: "inline",
                formats: [:html],
                layout: "pdf",
                dpi: 400
            end
        end
    end

    
end