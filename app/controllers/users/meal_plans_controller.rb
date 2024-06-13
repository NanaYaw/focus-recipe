class Users::MealPlansController < ApplicationController
  before_action :set_meal_plan, only: %i[show edit update destroy update_serving delete_serving]

  def index
    @meal_plans = MealPlan.all
  end

  def show
  end

  def new
    @meal_plan = MealPlan.new
  end

  def edit
  end

  def create
    @meal_plan = MealPlan.new(meal_plan_params)

    respond_to do |format|
      if @meal_plan.save
        format.html { redirect_to meal_plan_url(@meal_plan), notice: "Meal plan was successfully created." }
        format.json { render :show, status: :created, location: @meal_plan }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @meal_plan.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      @meal_plan.meals[meal_plan_params[:day]] = meal_plan_params[:meal]
      if @meal_plan.save!

        format.html { redirect_to meal_plan_url(@meal_plan), notice: "Meal plan was successfully updated." }
        format.json { render :show, status: :ok, location: @meal_plan }
      else
        format.turbo_stream
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @meal_plan.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_serving
    @meal_plan = MealPlan.joins(plan: [recipes: :ingredients]).find_by({plan_id: meal_plan_params[:plan_id], meal_type: meal_plan_params[:meal_type], day: params[:day]})

    @meal_plan.number_of_persons_to_be_served = @meal_plan.number_of_persons_to_be_served + 1

    if @meal_plan.save!
      Turbo::StreamsChannel.broadcast_replace_to :servings, target: "servings",
        partial: "users/recipes/serving",
        locals: {serving: @meal_plan.number_of_persons_to_be_served}

      @meal_plan.recipe.ingredients.map do |t|
        quantity = IngredientQuantityCalculator.new(qty = t.quantity, serving = @meal_plan.number_of_persons_to_be_served.to_i).call

        Turbo::StreamsChannel.broadcast_replace_to :servings, target: "quantity-#{t.id}",
          partial: "users/recipes/ingredient_quantity",
          locals: {quantity: quantity, id: t.id}
      end
    end
  end

  def delete_serving
    @meal_plan = MealPlan.find_by({plan_id: meal_plan_params[:plan_id], meal_type: meal_plan_params[:meal_type], day: params[:day]})

    if @meal_plan.number_of_persons_to_be_served > 1
      @meal_plan.number_of_persons_to_be_served = @meal_plan.number_of_persons_to_be_served - 1

      if @meal_plan.save!
        Turbo::StreamsChannel.broadcast_replace_to :servings, target: "servings",
          partial: "users/recipes/serving",
          locals: {serving: @meal_plan.number_of_persons_to_be_served}

        @meal_plan.recipe.ingredients.map do |t|
          quantity = IngredientQuantityCalculator.new(qty = t.quantity, serving = @meal_plan.number_of_persons_to_be_served.to_f).call

          Turbo::StreamsChannel.broadcast_replace_to :servings, target: "quantity-#{t.id}",
            partial: "users/recipes/ingredient_quantity",
            locals: {quantity: quantity, id: t.id}
        end
      end
    end
  end

  def destroy
    @meal_plan.destroy

    respond_to do |format|
      Turbo::StreamsChannel.broadcast_replace_to :mealplans_list, target: "meal_plan_#{@meal_plan[:plan_id]}_#{params[:meal_type]}_#{params[:day]}",
        partial: "users/plans/meal_plan_empty",
        locals: {meal_type: meal_plan_params[:meal_type], day: meal_plan_params[:day], plan_id: meal_plan_params[:plan_id]}

      format.html { redirect_to meal_plans_url, notice: "Meal plan was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def set_meal_plan
    @cc = {plan_id: meal_plan_params[:plan_id], meal_type: meal_plan_params[:meal_type], day: meal_plan_params[:day]}
    @meal_plan = MealPlan.find_by(id: params[:id])
  end

  def meal_plan_params
    params.permit(:plan_id, :meal, :meal_type, :day)
  end
end
