class Admins::RecipesController < DashboardsController 
  # before_action :ensure_frame_response, only: [:new, :create, :title]
  before_action :set_recipe, only: %i[ show edit edit_title update_title create_directions update destroy ]


  # GET /recipes or /recipes.json
  def index
    @pagy, @recipes = pagy(Recipe.includes(:recipe_category).order(created_at: :DESC))
  end

  # GET /recipes/1 or /recipes/1.json
  def show
    @recipe_ingredients = Ingredient.includes(:grocery, :measurement_unit, :ingredient_state).where(recipe_id: @recipe.id).order("id ASC")
  end

  # GET /recipes/new
  def new
    @recipe = Recipe.new
  end

  # GET /recipes/1/edit
  def edit
    @recipe_ingredients = Ingredient.includes(:grocery, :measurement_unit, :ingredient_state).where(recipe_id: @recipe.id).order("id ASC")
          
    # Turbo::StreamsChannel.broadcast_append_to :recipe_form_update, 
    #   target: "recipe-ingredients--list", 
    #   partial: "recipes/recipe_sub_ingredient", 
    #   locals: {id: @recipe.id, recipe_ingredient: @recipe_ingredients, recipe: @recipe}
  end

  # POST /recipes or /recipes.json
  def create
    @recipe = Recipe.new(recipe_params)

    respond_to do |format|
      if @recipe.save
        format.turbo_stream
        format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully created." }
        format.json { render :show, status: :created, location: @recipe }
      else
        format.turbo_stream
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @recipe.errors, status: :unprocessable_entity }
      end
    end
  end

  
  # def create_ingredient
    #   @recipe = Recipe.find(params[:id])
    #   @recipe_ingredient = @recipe.ingredients.new(quantity: recipe_ingredient_params[:quantity], grocery_id: recipe_ingredient_params[:grocery_id], measurement_unit_id: recipe_ingredient_params[:measurement_unit_id], ingredient_state_id: recipe_ingredient_params[:ingredient_state_id])
      
    #   respond_to do |format|
    #     if @recipe_ingredient.save
    #       # Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
    #         #   target: "recipe_#{@recipe.id}", 
    #         #   partial: "admins/recipes/ingredient/recipe_sub_ingredient_list", 
    #         #   locals: {
    #           #     recipe_id: @recipe.id, 
    #         #     index: 0, 
    #         #     ingredient: @recipe_ingredient, 
    #         #     recipe: @recipe
    #         #   }

            
    #         flash.now[:notice] = "Recipe was successfully updated." 
    #         flash.now[:alert] = "Recipe was successfully updated." 
    #         # render turbo_stream: [
    #         #       turbo_stream.prepend(
    #         #         "recipe_#{@recipe.id}",
    #         #         partial: "admins/recipes/ingredient/recipe_sub_ingredient_list",
    #         #         locals: {
    #         #           recipe_id: @recipe.id, 
    #         #           index: 0, 
    #         #           ingredient: @recipe_ingredient, 
    #         #           recipe: @recipe
    #         #         },
    #         #       ),
    #         #       turbo_stream.replace("flash", partial: "application/flash"),
    #         #     ]

    #       format.turbo_stream
    #       format.html {  }
    #       format.js
    #       format.json { render json: {status: :ok } }    
    #     else  
    #       flash.now[:notice] = @recipe_ingredient.errors
    #       Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, 
    #           target: "recipe_ingredient_form", 
    #           partial: "admins/recipes/ingredient/recipe_sub_ingredient_form", 
    #           locals: {
    #             ingredient: @recipe_ingredient, 
    #             recipe_id: @recipe.id
    #           }


    #       # format.html { render :edit, status: :unprocessable_entity }
    #       # format.json { render json: @recipe_ingredient.errors, status: :unprocessable_entity }
    #     end
    #   end
  # end



  # PATCH/PUT /recipes/1 or /recipes/1.json
  def update
   
    respond_to do |format|
      if @recipe.update(recipe_params)
        format.html { redirect_to edit_recipe_url(@recipe), notice: "Recipe was successfully updated." }
        format.json { render :show, status: :ok, location: @recipe }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @recipe.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /recipes/1 or /recipes/1.json
  def destroy
    @recipe.destroy

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to recipes_url, notice: "Recipe was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  # DIRECTIONS -------------------------------------
  
  # DIRECTIONS -------------------------------------

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_recipe
      @recipe = Recipe.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def recipe_params
      params.require(:recipe).permit(:title, :image, :recipe_category_id, :status)
    end

    def recipe_ingredient_params
      params.permit(:quantity, :ingredient_state_id, :measurement_unit_id, :grocery_id)
    end

    # def ensure_frame_response
    #   return unless Rails.env.development?
    #   redirect_to recipes_url unless turbo_frame_request?
    # end
end
