class Users::GroceryListController < ApplicationController

    def index
    end

    # def show
    #     @mealplan = MealPlan.where(plan_id: params[:id]).includes(:plan)

    #     @recipes = @mealplan.includes(recipe: [:image_attachment, :reviews, :favorites, ingredients: [:grocery, :measurement_unit, :ingredient_state]]).uniq

    #     @groceries = GroceryShoppingList.new(@recipes.pluck(:recipe_id)).grocery_list

    #     meal_types = MealType::MEAL_TYPE
    #     days = DaysOfTheWeek::DAYS_OF_THE_WEEK

    #     @meal_plans = meal_plaan_grid(plan_id: params[:id], mealtypes: meal_types, days: days)

    #     respond_to do |format|
    #     format.html

    #     format.pdf do
    #         render pdf: @mealplan[0].plan.plan_name.tr(" ", "-"),
    #         title: @mealplan[0].plan.plan_name,
    #         template: "users/plans/print_pdf",
    #         disposition: "inline",
    #         formats: [:html],
    #         layout: "pdf",
    #         dpi: 400
    #     end
    #     end
    # end

    # private

    # def meal_plaan_grid(plan_id:, mealtypes:, days:)
    #     mealplan_data = MealPlan.where(plan_id: plan_id).select(:meal_type, :recipe_id, :day, :id).includes(recipe: [:reviews, {image_attachment: :blob}]).group_by(&:meal_type).with_indifferent_access

    #     mealplans = {}
    #     mealtypes.each do |mealtype|
    #     mealplans[mealtype] = if mealplan_data[mealtype].present?
    #         mealplan_data[mealtype].each_with_object({}) do |mealplan, hash|
    #         days.each do |day|
    #             hash[day] ||= nil

    #             if mealplan.day == day
    #             hash[mealplan.day] = mealplan
    #             end
    #         end
    #         end
    #     else
    #         days.each_with_object({}) do |day, hash|
    #         hash[day] = nil
    #         end
    #     end
    #     end

    #     mealplans
    # end
   def show
  @mealplans = MealPlan.includes(recipe: [:image_attachment, :reviews, :favorites, ingredients: [:grocery, :measurement_unit, :ingredient_state]])
                       .where(plan_id: params[:id])

#   recipes = @mealplans.map do |meal_plan|
#     meal_plan.recipe ? [meal_plan.recipe.id] : []
#   end

  @groceries = GroceryShoppingList.new(mealplans.pluck(:recipe_id)).grocery_list

  # Assuming you are still interested in meal types and days
  meal_types = MealType::MEAL_TYPE
  days = DaysOfTheWeek::DAYS_OF_THE_WEEK

  @meal_plans = meal_plaan_grid(@mealplans, meal_types, days)

  debugger

  respond_to do |format|
    format.html

    format.pdf do
      render pdf: @mealplans.first.plan.plan_name.tr(" ", "-"),
             title: @mealplans.first.plan.plan_name,
             template: "users/plans/print_pdf",
             disposition: "inline",
             formats: [:html],
             layout: "pdf",
             dpi: 400
    end
  end
end



    private

    def meal_plaan_grid(mealplans, mealtypes, days)
  # Initialize mealplan grid
  mealplans_grid = mealtypes.each_with_object({}) do |mealtype, grid|
    # Filter mealplans by meal_type and organize by day
    grid[mealtype] = days.each_with_object({}) do |day, hash|
      # Find the mealplan that matches the mealtype and day
      mealplan_for_day = mealplans.select do |mp|
        
        mp.meal_type == mealtype && mp.day == day 
      end.first
      hash[day] = mealplan_for_day || nil
    end
  end

  mealplans_grid
end

end