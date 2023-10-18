class Users::ReviewsController < ApplicationController
    before_action :set_recipe
    before_action :set_rating_permission, only: %i[:update_rating]

    def index
        @reviews = @recipe.reviews.includes(:user)
    end

    def new 
        
        @review = @recipe.reviews.new

    end

    def reply 
        
        @review = @recipe.reviews.new(parent_id: params[:parent_id])

        # p ">>>>>>>>>>>>>>>>>>>>>>>>"
        # p @review
        # p ">>>>>>>>>>>>>>>>>>>>>>>>"
      
        if(@review.parent_id)
            Turbo::StreamsChannel.broadcast_prepend_to "review-list", 
            target: "review-#{@review.parent_id}", 
            partial: "users/reviews/reply",
            locals: {:parent_id => params[:parent], recipe: @recipe, review: @review}
        end 
    end

    def create
        @review = @recipe.reviews.new set_rating_permission
        @review.user = current_user
        
        if @review.save
           
            redirect_to recipe_review_path(@recipe, 39), notice: "Review created successfully"
        else
            # p "+++++++++++++++++++++++++++++++++++++++++++++++++"
            # p @review
            # p "+++++++++++++++++++++++++++++++++++++++++++++++++"
            render :new, status: :unprocessable_entity
        end
    end

    def edit
    end

    def update
        respond_to do |format|
            if @recipe.reviews.update(set_rating_permission)

                format.html { redirect_to recipe_url(@recipe), notice: "Plan was successfully updated." }
                format.json { render :show, status: :ok, location: @recipe }
            else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @recipe.errors, status: :unprocessable_entity }
            end
        end
    end

    def update_rating
        respond_to do |format|

            if @recipe.reviews.find(set_rating_permission[:id]).update!(stars: set_rating_permission[:rating])

                format.html { redirect_to recipe_url(@recipe), notice: "Plan was successfully updated." }
                format.json { render :show, status: :ok, location: @recipe }
            else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @recipe.errors, status: :unprocessable_entity }
            end
        end
    end


private

    def set_recipe 
        @recipe = Recipe.find_by!(id: params[:recipe_id].to_i)
    end

    # def set_rating
    #     @recipe = Recipe.find_by!(id: params[:id], recipe_id: params[:recipe_id])
    # end

    def set_rating_permission
        params.require(:review).permit(:rating, :comment,  :recipe_id, :parent_id, :id)
    end

end
