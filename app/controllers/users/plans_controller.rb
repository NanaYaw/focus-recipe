class Users::PlansController < ApplicationController
  before_action :set_plan, only: %i[show edit update destroy]
  before_action :ensure_frame_response, only: [:new, :edit]

  # GET /plans or /plans.json
  def index
    @plans = Plan.all
  end

  def lazy_update
    plans = if current_user.present?
      Plan.where(user_id: current_user.id)
    else
      Plan.all
    end

    @colors = [{from: "blue", to: "purple"}, {from: "gray", to: "yellow"}, {from: "red", to: "green"}]

    @plans = plans

    render partial: "users/plans/lazy_update", locals: {plans: @plans}
  end

  def photo
  end

  def meal_plans
    param = {}
    param[:plan_id] = params[:plan_id]
    param[:meal_type] = params[:meal_type]
    param[:day] = params[:day]

    @params = param
  end

  def show
    @mealtypes = MealType::MEAL_TYPE
    @days = DaysOfTheWeek::DAYS_OF_THE_WEEK

    @mealplans = meal_plaan_grid(plan_id: params[:id], mealtypes: @mealtypes, days: @days)

    
    binding.pry
    
  end

  def new
    @plan = Plan.new
  end

  def edit
  end

  def create
    @plan = Plan.new(plan_name: plan_params[:plan_name], user_id: current_user.id)

    respond_to do |format|
      if @plan.save
        format.turbo_stream {
          render turbo_stream: turbo_stream.action(:redirect, "/plans")
        }

      else
        render :new, status: :unprocessable_entity
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

  def meal_plaan_grid(plan_id:, mealtypes:, days:)
    mealplan_data = MealPlan
                      .where(plan_id: plan_id)
                      .select(:meal_type, :recipe_id, :day, :id)
                      .includes(recipe: [:reviews, { image_attachment: :blob }])
                      .group_by(&:meal_type)
                      .with_indifferent_access

    mealplans = mealtypes.each_with_object({}) do |mealtype, grid|
      grid[mealtype] = build_mealplan_for_mealtype(mealplan_data[mealtype], days)
    end

    mealplans
  end

  def build_mealplan_for_mealtype(mealplans_for_type, days)
    mealplans_for_type ||= []
    
    mealplans_for_type.each_with_object(default_mealplan(days)) do |mealplan, grid|
      grid[mealplan.day] = mealplan
    end
  end

  def default_mealplan(days)
    days.each_with_object({}) { |day, hash| hash[day] = nil }
  end
end
