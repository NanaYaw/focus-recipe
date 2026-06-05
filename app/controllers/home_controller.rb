class HomeController < ApplicationController
    before_action :authenticate_user!, except: [:index, :testmailer]

    def index
        @recipes = Recipe.includes(:reviews, :ingredients, :favorites, :meal_plans, image_attachment: :blob).where(status: 'published').limit(12)
        recipe_ids = @recipes.map(&:id)
                @reviews_avg = Review.where(recipe_id: recipe_ids).group(:recipe_id).average(:stars).transform_values { |v| v&.round(1) || 0.0 }
                @mealplan_sums = MealPlan.where(recipe_id: recipe_ids).unscope(:order).group(:recipe_id).sum(:number_of_persons_to_be_served)
                @recipes.each do |r|
                    r.precompute_average_stars(@reviews_avg[r.id] || 0.0)
                    r.precompute_mealplan_sum(@mealplan_sums[r.id] || 0)
                end
    end

  
end