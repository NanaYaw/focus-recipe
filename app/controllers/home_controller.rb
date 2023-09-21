class HomeController < ApplicationController
    before_action :authenticate_user!, except: :index

    def index
        @recipes = Recipe.all
        @mealtypes = MealType::MEAL_TYPE
        @days = DaysOfTheWeek::DAYS_OF_THE_WEEK
        @mealplan_data = MealPlan.where(plan_id: 1).select(:meal_type, :recipe_id, :day).includes(recipe: [:reviews]).group_by(&:meal_type).with_indifferent_access

        @mealplans = {}
        @mealtypes.each do |mealtype|
            if @mealplan_data[mealtype].present?
                @mealplans[mealtype] = @mealplan_data[mealtype].each_with_object({}) do |mealplan, hash|
                    @days.each do |day|
                        hash[day] ||= nil
                        
                        if mealplan.day == day
                            hash[mealplan.day] = mealplan
                        end
                    end
                end
            else
                @mealplans[mealtype] = @days.each_with_object({}) do |day, hash|
                    hash[day] = nil 
                end
            end
        end
        
    end
end