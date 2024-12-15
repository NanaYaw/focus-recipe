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
                  partial: "users/plans/meal_plan",
                  locals: {meals: @mealplan.recipe, meal_type: params[:meal_type], day: params[:day], recipe: @mealplan.recipe, plan_id: @mealplan[:plan_id], id: @mealplan.id}

                format.json { render json: {status: :ok} }
              else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @mealplan.errors, status: :unprocessable_entity }
              end
            end
          end


      end
    end
  end
end