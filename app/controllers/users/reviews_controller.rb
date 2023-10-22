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
      
        if(@review.parent_id)
            Turbo::StreamsChannel.broadcast_prepend_to "review-list", 
            target: "review-reply#{params[:inner].present? ? "-cc" : ""}-#{@review.parent_id}", 
            partial: "users/reviews/reply",
            locals: {:parent_id => params[:parent], recipe: @recipe, review: @review}
        end 
    end

    def create
        @review = @recipe.reviews.new set_rating_permission
        @review.user = current_user
       

        # p "++++++++++++++++++++++++++++++++++++++++++++++"
        # p @review.parent
        # p "======================"
        # p "parent - #{@review.parent_id}"
        # p "======================"
        # p params
        # p "++++++++++++++++++++++++++++++++++++++++++++++"

        if @review.save

            params_parent_id = params[:review][:parent_id]

            if @review.parent_id.blank? && params_parent_id.blank?
                target = @recipe.id 
                Turbo::StreamsChannel.broadcast_prepend_to :reviews, 
                target: "reviews-#{target}", 
                partial: "users/reviews/review_single",
                locals: {
                    recipe: @recipe, 
                    review: @review,
                    parent_id: params[:parent],
                    current_user: current_user,
                    target: target
                }

                Turbo::StreamsChannel.broadcast_remove_to "review-list", 
                target: "review-reply#{params[:inner].present? ? "-cc" : ""}-#{@review.parent_id}"

                render turbo_stream: turbo_visit(recipe_plans_path(@recipe, meal_plan_id: params[:review][:meal_plan_id].to_i))

            elsif !@review.parent_id.blank? && !params_parent_id.blank? 
                target = "#{@recipe.id}-#{@review.parent_id}" 
                Turbo::StreamsChannel.broadcast_prepend_to :reviews, 
                target: "reviews-#{target}", 
                partial: "users/reviews/review_single",
                locals: {
                    :parent_id => params[:parent], 
                    recipe: @recipe, 
                    review: @review, 
                    current_user: current_user,
                    target: target
                }

                Turbo::StreamsChannel.broadcast_remove_to "review-list", 
                target: "review-reply#{params[:inner].present? ? "-cc" : ""}-#{@review.parent_id}"
            elsif @review.parent_id.blank? && !params_parent_id.blank? 
                target = "#{@review.id}" 
                Turbo::StreamsChannel.broadcast_prepend_to :reviews, 
                target: "reviews-#{target}", 
                partial: "users/reviews/review_single",
                locals: {
                    :parent_id => params[:parent], 
                    recipe: @recipe, 
                    review: @review, 
                    current_user: current_user,
                    target: target
                }

                Turbo::StreamsChannel.broadcast_remove_to "review-list", 
                target: "review-reply#{params[:inner].present? ? "-cc" : ""}-#{@review.parent_id}" 
            else
            end

            
            # if !@review.parent_id.blank?
            #     target = "#{@recipe.id}-#{@review.parent_id}" 
            #     Turbo::StreamsChannel.broadcast_prepend_to :reviews, 
            #     target: "reviews-#{target}", 
            #     partial: "users/reviews/review_single",
            #     locals: {
            #         :parent_id => params[:parent], 
            #         recipe: @recipe, 
            #         review: @review, 
            #         current_user: current_user,
            #         target: target
            #     }

            #     Turbo::StreamsChannel.broadcast_remove_to "review-list", 
            #     target: "review-reply#{params[:inner].present? ? "-cc" : ""}-#{@review.parent_id}"
            # else
            #     target = @recipe.id 
            #     Turbo::StreamsChannel.broadcast_prepend_to :reviews, 
            #     target: "reviews-#{target}", 
            #     partial: "users/reviews/review_single",
            #     locals: {
            #         recipe: @recipe, 
            #         review: @review,
            #         parent_id: params[:parent],
            #         current_user: current_user,
            #         target: target
            #     }
            # end

            # redirect_to recipe_plans_path(@recipe, meal_plan_id: params[:meal_plan_id].to_i), turbo_frame: "_top", notice: "Review created successfully"
            # render turbo_stream: turbo_visit(recipe_plans_path(@recipe, meal_plan_id: params[:meal_plan_id].to_i))

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

def turbo_visit(url, frame: nil, action: nil)
  options = {frame: frame, action: action}.compact
  turbo_stream.append_all("head") do
    helpers.javascript_tag(<<~SCRIPT.strip, nonce: true, data: {turbo_cache: false})
      window.Turbo.visit("#{helpers.escape_javascript(url)}", #{options.to_json})
      document.currentScript.remove()
    SCRIPT
  end
end

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
