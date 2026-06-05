module Api
  module V1
    module Users
      class PlansController < ApplicationController

        def meal_update
          @mealplan = MealPlan.where({plan_id: params[:plan_id], meal_type: params[:meal_type], day: params[:day]}).includes(recipe: [:reviews, {image_attachment: :blob}])
          @mealplan = @mealplan[0]

          if !@mealplan.blank?
            @mealplan.day = params[:day]
            @mealplan.recipe_id = params[:recipe_id]
            @mealplan.meal_type = params[:meal_type]
          else
            @mealplan = MealPlan.create!(plan_id: params[:plan_id], meal_type: params[:meal_type], day: params[:day], recipe_id: params[:recipe_id])
          end

          respond_to do |format|
            if @mealplan.save!

              Turbo::StreamsChannel.broadcast_replace_to :mealplans_list, target: "meal_plan_#{@mealplan[:plan_id]}_#{params[:meal_type]}_#{params[:day]}",
                partial: "plans/meal_plan",
                locals: {meals: @mealplan.recipe, meal_type: params[:meal_type], day: params[:day], recipe: @mealplan.recipe, plan_id: @mealplan[:plan_id], id: @mealplan.id}

              format.json { render json: {status: :ok} }
            else
              format.html { render :edit, status: :unprocessable_entity }
              format.json { render json: @mealplan.errors, status: :unprocessable_entity }
            end
          end
        end


        # rrefactor this method into its proper controller
        def meal_plans_content
                  @meal_plans = Recipe.where(status: "published").includes(:favorites, :meal_plans, :reviews, image_attachment: :blob)
                  recipe_ids = @meal_plans.map(&:id)
                  @reviews_avg = Review.where(recipe_id: recipe_ids).group(:recipe_id).average(:stars).transform_values { |v| v&.round(1) || 0.0 }
                  @mealplan_sums = MealPlan.where(recipe_id: recipe_ids).unscope(:order).group(:recipe_id).sum(:number_of_persons_to_be_served)
                  @meal_plans.each do |r|
                    r.precompute_average_stars(@reviews_avg[r.id] || 0.0)
                    r.precompute_mealplan_sum(@mealplan_sums[r.id] || 0)
                  end
          param = {}
          param[:plan_id] = params[:plan_id]
          param[:meal_type] = params[:meal_type]
          param[:day] = params[:day]

          @params = param

          render partial: "plans/meal_plans_content"
        end


      end
    end
  end
end