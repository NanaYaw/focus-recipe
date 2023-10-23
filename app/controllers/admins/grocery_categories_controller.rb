class Admins::GroceryCategoriesController < DashboardsController
  before_action :ensure_frame_response, only: [:new, :edit ]
  before_action :set_grocery_category, only: %i[ show edit update destroy ]

  def index
    @pagy, @grocery_categories = pagy(GroceryCategory.all)
  end

  def show
  end

  def new
    @grocery_category = GroceryCategory.new
  end

  def edit
  end

  def create
    @grocery_category = GroceryCategory.new(grocery_category_params)

    respond_to do |format|
      if @grocery_category.save
        format.html { redirect_to grocery_category_url(@grocery_category), notice: "Recipe was successfully created." }
        format.json { render :show, status: :created, location: @grocery_category }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @grocery_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /recipes/1 or /recipes/1.json
  def update
    respond_to do |format|
      if @grocery_category.update(grocery_category_params)
        format.html { redirect_to recipe_url(@grocery_category), notice: "Recipe was successfully updated." }
        format.json { render :show, status: :ok, location: @grocery_category }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @grocery_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /recipes/1 or /recipes/1.json
  def destroy
    @grocery_category.destroy

    respond_to do |format|
      format.html { redirect_to grocery_category_url, notice: "Recipe was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_grocery_category
      @grocery_category = GroceryCategory.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def grocery_category_params
      params.require(:grocery_category).permit(:name, :description)
    end

    def ensure_frame_response
        return unless Rails.env.development?
        redirect_to grocery_categories_path unless turbo_frame_request?
    end
end
