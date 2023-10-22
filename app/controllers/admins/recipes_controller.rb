class Admins::RecipesController < DashboardsController 
  before_action :set_recipe, only: %i[ show edit edit_title update_title create_directions update destroy ]
  # before_action :ensure_frame_response, only: [:new, :create, :title, :create_ingredient, :edit_direction, :update_direction, :delete_direction]


  # GET /recipes or /recipes.json
  def index
    @pagy, @recipes = pagy(Recipe.all.order(created_at: :DESC))
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

  def new_title
    @recipe = Recipe.new
  end

  def create_title
    if params[:edit]
      @recipe = Recipe.find(params[:id])
      @recipe.title = params[:title]
    else
      @recipe = Recipe.new(recipe_params)
    end


    respond_to do |format| 
      if @recipe.save
        # format.turbo_stream {render turbo_stream: turbo_stream.replace(@recipe)}
        # format.turbo_stream
        format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully created." }
        # Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, target: "recipe-update-#{@recipe.id}", partial: "recipes/recipe_sub_form", locals: {id: @recipe.id}
        format.json { render :show, status: :created, location: @recipe }
      else
        format.html { render :new_title, status: :unprocessable_entity }
        format.json { render json: @recipe.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit_title
  end

  def update_title
    respond_to do |format| 
      if @recipe.update(recipe_params)
        # format.turbo_stream {render turbo_stream: turbo_stream.replace(@recipe)}
        # format.turbo_stream
        format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully created." }
        # Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, target: "recipe-update-#{@recipe.id}", partial: "recipes/recipe_sub_form", locals: {id: @recipe.id}
        format.json { render :index, status: :created, location: @recipe }
      else
        format.html { render :new_title, status: :unprocessable_entity }
        format.json { render json: @recipe.errors, status: :unprocessable_entity }
      end
    end
  end

  def new_ingredient

    @ingredient = Ingredient.new
    @recipe_id = params[:id]
  end

  def create_ingredient
    @recipe = Recipe.find(params[:id])
    @recipe_ingredient = @recipe.ingredients.new(quantity: recipe_ingredient_params[:quantity], grocery_id: recipe_ingredient_params[:grocery_id], measurement_unit_id: recipe_ingredient_params[:measurement_unit_id], ingredient_state_id: recipe_ingredient_params[:ingredient_state_id])
    
    respond_to do |format|
      if @recipe_ingredient.save
          Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
            target: "recipe_#{@recipe.id}", 
            partial: "recipes/ingredient/recipe_sub_ingredient_list", 
            locals: {
              recipe_id: @recipe.id, 
              index: 0, 
              ingredient: @recipe_ingredient, 
              recipe: @recipe
            }

        format.html {  }
        format.json { render :show, status: :ok, location: @recipe }
      else  
        Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, 
            target: "recipe_ingredient_form", 
            partial: "recipes/ingredient/recipe_sub_ingredient_form", 
            locals: {
              ingredient: @recipe_ingredient, 
              recipe_id: @recipe.id
            }
            
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @recipe_ingredient.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit_ingredient
  end

  # PATCH/PUT /recipes/1 or /recipes/1.json
  def update
   
    respond_to do |format|
      if @recipe.update(recipe_params)
        format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully updated." }
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
      format.html { redirect_to recipes_url, notice: "Recipe was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  # DIRECTIONS -------------------------------------
  def create_directions
    params[:direction].each do |index, item|
      @recipe.directions << item
    end

    if @recipe.save
      Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
            target: "recipe_#{@recipe.id}", 
            partial: "recipes/recipe_sub_ingredient_list", 
            locals: {id: @recipe.id, index: 0, ingredient: @recipe_ingredient, recipe: @recipe}

      format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully updated." }
      format.json { render :show, status: :ok, location: @recipe }
    else 
      format.html { render :edit, status: :unprocessable_entity }
      format.json { render json: @recipe.errors, status: :unprocessable_entity }
    end
  end

  def edit_direction
    direction_id = params[:direction_id].to_i
    @direction_id = direction_id || 2
    # @ingredient = Recipe.find(params[:recipe_id]).directions.select.with_index{ |direction, index| index === direction_id}
    ingredient = Recipe.find(params[:recipe_id]).directions
    @ingredient = ingredient.select.with_index{|ingredient, idx|  idx === direction_id}
    @recipe_id = params[:recipe_id]
  end

  def update_direction
    ingredient = Recipe.find(params[:recipe_id])
    ingredient.directions[params[:id].to_i] = params[:direction]

    if  ingredient.save!
      # Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
      #       target: "recipe_#{@recipe.id}", 
      #       partial: "recipes/recipe_sub_ingredient_list", 
      #       locals: {id: @recipe.id, index: 0, ingredient: @recipe_ingredient, recipe: @recipe}

      format.html {  }
      format.json {  }
    else 
      format.html { render :edit, status: :unprocessable_entity }
      format.json { render json: @recipe.errors, status: :unprocessable_entity }
    end
  end


  def delete_direction
    ingredient = Recipe.find(params[:recipe_id])
    ingredient.directions.delete_at(params[:id])

    if  ingredient.save!
      Turbo::StreamsChannel.broadcast_remove_to :recipe_form_update, target: "edit_ddirection_#{params[:id]}"

      format.html {  }
      format.json {  }
    else 
      format.html { render :edit, status: :unprocessable_entity }
      format.json { render json: @recipe.errors, status: :unprocessable_entity }
    end
  end
  # DIRECTIONS -------------------------------------

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_recipe
      @recipe = Recipe.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def recipe_params
      params.require(:recipe).permit(:title, :image)
    end

    def recipe_ingredient_params
      params.permit(:quantity, :ingredient_state_id, :measurement_unit_id, :grocery_id)
    end

    def ensure_frame_response
      return unless Rails.env.development?
      redirect_to root_path unless turbo_frame_request?
    end
end
