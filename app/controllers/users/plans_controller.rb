class Users::PlansController < ApplicationController
  before_action :set_plan, only: %i[ show edit update destroy ]

  # GET /plans or /plans.json
  def index
    @plans = Plan.all
  end
  
  def meal_plans
    @meal_plans = Recipe.all
    param = {}
    param[:plan_id] = params[:plan_id]
    param[:meal_type] = params[:meal_type]
    param[:day] = params[:day]
    @params = param
  end 

  # GET /plans/1 or /plans/1.json
  def show

    meal_types = MealType::MEAL_TYPE
    days = DaysOfTheWeek::DAYS_OF_THE_WEEK

    meal_plans = []

    meal_types.each do |meal_type|
      days.each do |day|
          meal_plans << { meal_type => { 
              day => MealPlan.where(plan_id: @plan.id, meal_type: meal_type, day: day).select(:id, :recipe_id, :day, :meal_type, :recipe_id).includes(:recipe)
            }
          }
      end
    end

    @meal_plans = meal_plans.each_with_object({}) do |e, h|
      h[e.keys.first] ||= []
      h[e.keys.first] << e.values.first
    end
  end

  # GET /plans/new
  def new
    @plan = Plan.new
  end

  # GET /plans/1/edit
  def edit
  end

  # POST /plans or /plans.json
  def create
    @plan = Plan.new(plan_name: plan_params[:plan_name], user_id: current_user.id)

    respond_to do |format|
      if @plan.save
        
        # if meal_type
          format.html { redirect_to plan_url(@plan), notice: "Plan was successfully created." }
          format.json { render :show, status: :created, location: @plan }
        # end
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /plans/1 or /plans/1.json
  def update
    respond_to do |format|
      if @plan.update(plan_params)
        format.html { redirect_to plan_url(@plan), notice: "Plan was successfully updated." }
        format.json { render :show, status: :ok, location: @plan }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  def grocery_list
    @recipes = MealPlan.where(plan_id: params[:id]).joins( recipe: [:reviews]).uniq
    @groceries = GroceryShoppingList.new(@recipes.pluck(:recipe_id)).grocery_list


    meal_types = MealType::MEAL_TYPE
    days = DaysOfTheWeek::DAYS_OF_THE_WEEK

    meal_plans = []

    meal_types.each do |meal_type|
      days.each do |day|
        meal_plans << { 
          meal_type => {
            day => MealPlan.where(plan_id: params[:id], meal_type: meal_type, day: day).select(:id, :recipe_id, :day, :meal_type, :recipe_id).includes(:recipe)
          }
        }
        # @recipes.each do |recipe|
        #   p "++++++++++++++++++++++++++++++++++"
        #   p recipe[day: "sunday"]
        #   p "++++++++++++++++++++++++++++++++++"
        #   if recipe[:day] == day && recipe[:meal_type] == meal_type
        #     meal_plans << { 
        #       meal_type => {
        #         day => recipe
        #       }
        #     }
        #   end
        # end
      end
    end

    @meal_plans = meal_plans.each_with_object({}) do |e, h|
      h[e.keys.first] ||= []
      h[e.keys.first] << e.values.first
    end

    # p "++++++++++++++++++++++++++++++++++++++++"
    # p @groceries
    # p "++++++++++++++++++++++++++++++++++++++++"
    # p @recipes
    # p "++++++++++++++++++++++++++++++++++++++++"
    # disposition: :inline,
    
    respond_to do |format|
      format.html

      format.pdf do
        render pdf: 'ama-boadiwaa',
        template: "users/plans/print_pdf",
        disposition: 'inline',
        formats: [:html],
        layout: 'pdf'
      end
    end
  end

  def meal_update
    @mealplan = MealPlan.where({plan_id: params[:plan_id], meal_type: params[:meal_type], day: params[:day]}).includes(:recipe)
    @mealplan = @mealplan[0]
   
    if (!@mealplan.blank?)
      @mealplan.day = params[:day]
      @mealplan.recipe_id = params[:recipe_id]
      @mealplan.meal_type = params[:meal_type]
    else
      @mealplan = MealPlan.create!(meal_type: params[:meal_type], recipe_id: params[:recipe_id], day: params[:day], plan_id: params[:plan_id])
    end

    if @mealplan.save!

      @recipe = Recipe.find(params[:recipe_id])

      Turbo::StreamsChannel.broadcast_replace_to :mealplans_list, target: "meal_plan_#{params[:meal_type]}_#{params[:day]}", 
      partial: "users/plans/meal_plan", 
      locals: {meals: @recipe, meal_type: params[:meal_type], day: params[:day], recipe: @recipe, plan_id: @mealplan[:plan_id]}
    else
      format.html { render :edit, status: :unprocessable_entity }
      format.json { render json: @plan.errors, status: :unprocessable_entity } 
    end
  end

  # DELETE /plans/1 or /plans/1.json
  def destroy
    @plan.destroy

    respond_to do |format|
      format.html { redirect_to plans_url, notice: "Plan was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_plan
      if(params[:id] == 'meal_update')
        @plan = Plan.find(params[:plan_id]) if params[:id] != 'meal_update'
      else
        @plan = Plan.find(params[:id])
      end
    end

    # Only allow a list of trusted parameters through.
    def plan_params
      params.require(:plan).permit(:plan_name)
    end
end
