class PlansController < ApplicationController
  before_action :authenticate_user!
  before_action :set_plan, only: %i[show edit update destroy]
  before_action :ensure_frame_response, only: [:new, :edit]

  # GET /plans or /plans.json
  def index
    @plans = Plan.includes(meal_plans: { recipe: [:image_attachment, :reviews, :ingredients] }).all
  end

  def cc
    Plan.all
  end

  def lazy_update
    plans = if current_user.present?
      Plan.where(user_id: current_user.id).includes(meal_plans: { recipe: [:image_attachment, :reviews, :ingredients] })
    else
      Plan.includes(meal_plans: { recipe: [:image_attachment, :reviews, :ingredients] }).all
    end

    @colors = [{from: "blue", to: "purple"}, {from: "gray", to: "yellow"}, {from: "red", to: "green"}]

    @plans = plans

    render template: "plans/lazy_update", layout: false
  end

  def photo
  end

  def meal_plans
    @meal_plans_query = params.to_unsafe_h.slice("plan_id", "meal_type", "day")

    Rails.logger.debug "[PLANS_CONTROLLER] meal_plans render without layout"

    respond_to do |format|
      format.html { render layout: false }
      format.turbo_stream { render template: "plans/meal_plans", formats: [:html], layout: false }
    end
  end

  def show
    meal_plans_service = NormalizerService.new(params['id'])
    meal_plans_service.call
    
    @mealplans = meal_plans_service.grid_normalizer
    recipe_ids = meal_plans_service.recipe_ids
    @reviews_avg = Review.where(recipe_id: recipe_ids).group(:recipe_id).average(:stars).transform_values { |v| v&.round(1) || 0.0 }
    @mealplan_sums = MealPlan.where(recipe_id: recipe_ids).unscope(:order).group(:recipe_id).sum(:number_of_persons_to_be_served)
    # assign precomputed values onto nested recipe objects
    @mealplans.each do |_, days|
      days.each do |_, meal_plan|
        next if meal_plan.blank? || meal_plan.recipe.blank?
        meal_plan.recipe.precompute_average_stars(@reviews_avg[meal_plan.recipe.id] || 0.0)
        meal_plan.recipe.precompute_mealplan_sum(@mealplan_sums[meal_plan.recipe.id] || 0)
      end
    end
    
  end

  def new
    @plan = Plan.new
    render layout: false
  end

  def edit
    render layout: false
  end

  def create
    @plan = Plan.new(plan_name: plan_params[:plan_name], user_id: current_user.id)

    respond_to do |format|
      if @plan.save
        format.turbo_stream do
          render turbo_stream: turbo_stream.action(:redirect, plans_path)
        end
        format.html { redirect_to plans_path, notice: "Plan was successfully created." }
      else
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace("modal", partial: "plans/form", locals: { plan: @plan }), status: :unprocessable_entity
        end
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @plan.update(plan_params)
        format.html { redirect_to plan_url(@plan), notice: "Plan was successfully updated." }
        format.json { render :json, status: :ok, location: @plan }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @plan.destroy

    respond_to do |format|
      format.html { redirect_to plans_url, notice: "Plan was successfully destroyed." }
      format.json { head :no_content }
    end
  end

 

  private

  def set_plan
    if params[:id] == "meal_update"
      @plan = Plan.find(params[:plan_id]) if params[:id] != "meal_update"
    else
      @plan = Plan.find(params[:id])
    end
  end

  def plan_params
    params.require(:plan).permit(:plan_name)
  end

  def ensure_frame_response
    return unless Rails.env.development?
    redirect_to root_path unless turbo_frame_request?
  end
end
