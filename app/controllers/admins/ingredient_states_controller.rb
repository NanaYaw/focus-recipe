class Admins::IngredientStatesController < ApplicationController
  before_action :set_ingredient_state, only: %i[ show edit update destroy ]

  # GET /ingredient_states or /ingredient_states.json
  def index
    @pagy, @ingredient_states = pagy(IngredientState.all)
  end

  # GET /ingredient_states/1 or /ingredient_states/1.json
  def show
  end

  # GET /ingredient_states/new
  def new
    @ingredient_state = IngredientState.new
  end

  # GET /ingredient_states/1/edit
  def edit
  end

  # POST /ingredient_states or /ingredient_states.json
  def create
    @ingredient_state = IngredientState.new(ingredient_state_params)

    respond_to do |format|
      if @ingredient_state.save
        format.html { redirect_to ingredient_state_url(@ingredient_state), notice: "Ingredient state was successfully created." }
        format.json { render :show, status: :created, location: @ingredient_state }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @ingredient_state.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /ingredient_states/1 or /ingredient_states/1.json
  def update
    respond_to do |format|
      if @ingredient_state.update(ingredient_state_params)
        format.html { redirect_to ingredient_state_url(@ingredient_state), notice: "Ingredient state was successfully updated." }
        format.json { render :show, status: :ok, location: @ingredient_state }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @ingredient_state.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /ingredient_states/1 or /ingredient_states/1.json
  def destroy
    @ingredient_state.destroy

    respond_to do |format|
      format.html { redirect_to ingredient_states_url, notice: "Ingredient state was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_ingredient_state
      @ingredient_state = IngredientState.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def ingredient_state_params
      params.require(:ingredient_state).permit(:name, :description, :status)
    end
end
