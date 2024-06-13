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

  def meal_plans_content
    @meal_plans = Recipe.where(status: "published").includes(:favorites, :meal_plans, :reviews, image_attachment: :blob)
    param = {}
    param[:plan_id] = params[:plan_id]
    param[:meal_type] = params[:meal_type]
    param[:day] = params[:day]

    @params = param

    render(partial: "users/plans/meal_plans_content")
  end

  def show
    @mealtypes = MealType::MEAL_TYPE
    @days = DaysOfTheWeek::DAYS_OF_THE_WEEK

    @mealplans = meal_plaan_grid(plan_id: params[:id], mealtypes: @mealtypes, days: @days)
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
