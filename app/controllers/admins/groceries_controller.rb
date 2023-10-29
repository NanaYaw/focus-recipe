class Admins::GroceriesController < DashboardsController
    before_action :ensure_frame_response, only: [:new, :edit ]
    before_action :set_grocery, only: %i[ show edit update destroy ]

    def index
        @pagy, @groceries = pagy(Grocery.all)
    end

    def search
        @groceries = Grocery.where("name LIKE ?", "%#{params[:q]}%").pluck(:id, :name)


        respond_to do |format|
            format.json
            format.html
        end
    end

    def show
    end

    def new
        @grocery = Grocery.new
    end

    def edit
    end

    def create

        

        @grocery = Grocery.new(grocery_params)

        respond_to do |format|
        if @grocery.save
            format.html { redirect_to grocery_url(@grocery), notice: "Recipe was successfully created." }
            format.json { render :show, status: :created, location: @grocery }
        else
            format.html { render :new, status: :unprocessable_entity }
            format.json { render json: @grocery.errors, status: :unprocessable_entity }
        end
        end
    end

    # PATCH/PUT /recipes/1 or /recipes/1.json
    def update
        respond_to do |format|
        if @grocery.update(grocery_params)
            format.html { redirect_to grocery_url(@grocery), notice: "Recipe was successfully updated." }
            format.json { render :show, status: :ok, location: @grocery }
        else
            format.html { render :edit, status: :unprocessable_entity }
            format.json { render json: @grocery.errors, status: :unprocessable_entity }
        end
        end
    end

    # DELETE /recipes/1 or /recipes/1.json
    def destroy
        @grocery.destroy

        respond_to do |format|
        format.html { redirect_to grocery_url, notice: "Recipe was successfully destroyed." }
        format.json { head :no_content }
        end
    end

    private
        # Use callbacks to share common setup or constraints between actions.
        def set_grocery
            @grocery = Grocery.find(params[:id])
        end

        # Only allow a list of trusted parameters through.
        def grocery_params
            params.require(:grocery).permit(:name, :description, :grocery_category_id)
        end

        def ensure_frame_response
            return unless Rails.env.development?
            redirect_to groceries_path unless turbo_frame_request?
        end
end
