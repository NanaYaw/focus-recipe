class Admins::IngredientsController < DashboardsController 
  before_action :set_ingredient, only: %i[ edit show update destroy create ]
  # before_action :set_recipe, excerpt: %i[ updated ]

  def index
    @recipes = Ingredient.all.includes(:grocery, :measurement_unit, :ingredient_state)
  end

  def new
    @ingredient = Ingredient.new
  end

  def create
    @ingredient = @recipe.ingredients.new(ingredient_params)

    respond_to do |format|
      if @ingredient.save
        flash.now[:notice] = "Ingredient created successfully"

        format.turbo_stream
      end
    end
  end

  def edit
  end

  def show
  end

  def update
   
    @recipe = Recipe.find(params[:recipe_id])

    respond_to do |format|
      # p @meal_plan
      
      if @ingredient.update!(ingredient_params)
        # p "ingredient--#{@ingredient}"
        
        # Turbo::StreamsChannel.broadcast_replace_to :mealplans_list, target: @plan
          # Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, 
          #   target: "ingredient--ingredient_#{@ingredient.id}", 
          #   partial: "admins/recipes/ingredient/recipe_sub_ingredient_list", 
          #   locals: {id: @recipe.id, index: 0, ingredient: @ingredient, recipe: @recipe}

        flash.now[:notice] = "Ingredient updated successfully"

        format.turbo_stream
        format.html { }
        format.json { render :json, status: :ok, location: @ingredient }
      else
        # format.turbo_stream
        # format.html { render :edit, status: :unprocessable_entity }
        # format.json { render json: @ingredient.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy

    @ingredient.destroy

    respond_to do |format|
      
      flash.now[:alert] = "Ingredient deleted successfully"

      format.turbo_stream
      format.html { }
      format.json { head :no_content }
    end
  end


 


private
  # Use callbacks to share common setup or constraints between actions.
  def set_ingredient
    p "----------------------------------------------"
    p params
    p @ingredient
    p "----------------------------------------------"
    if params[:id].present?
      @ingredient = Ingredient.find(params[:id].to_i)
    end

    if params[:recipe_id].present?
      @recipe = Recipe.find(params[:recipe_id].to_i)
    end
  end


  def ingredient_params
      params.permit(:quantity, :measurement_unit_id, :ingredient_state_id, :grocery_id, :recipe_id)
  end
end