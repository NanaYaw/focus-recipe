class Users::GroceryListController < ApplicationController

    def index
    end
    
    def show
        plan = Plan.find(3)

        @mealplan_data = MealPlan
                      .where(plan_id: 3)
                      .select(:meal_type, :recipe_id, :day, :id)
                      .eager_load(
                        recipe: [
                            :image_attachment, 
                            :reviews, 
                            :favorites, 
                            { ingredients: [:grocery, :measurement_unit, :ingredient_state] }
                        ]
                       )
                      .group_by(&:meal_type)
                      .with_indifferent_access

                      
        recipes = @mealplan_data.flat_map { |_, plans| plans.map(&:recipe_id) }.uniq
        @groceries = GroceryShoppingList.new(recipes).grocery_list
        
        @meal_plans = meal_plaan_grid(@mealplan_data)
        
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

    private

    def meal_plaan_grid(meal_plans)
        days ||= DaysOfTheWeek::DAYS_OF_THE_WEEK
        meal_types ||= MealType::MEAL_TYPE

        normalized_meal_plans = meal_types.each_with_object({}) do |meal_type, result|
            days_hash = days.map { |day| [day, nil] }.to_h
            
            if meal_plans[meal_type]
                meal_plans[meal_type].each do |plan|
                    days_hash[plan.day] = plan
                end
            end

            # Add the normalized hash to the result
            result[meal_type] = days_hash
        end

        normalized_meal_plans
    end
    
end