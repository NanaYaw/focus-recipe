class Users::FavoritesController < ApplicationController
    before_action :set_recipe

    def create
        @recipe.favorites.create!(user: current_user)
        # redirect_to  @recipe

        # p @recipe
        Turbo::StreamsChannel.broadcast_replace_to :favorite, target: "favorite_button", 
        partial: "users/recipes/favorite_fill", 
        locals: {recipe: @recipe, fav_fill: true}
    end

    def destroy
        @favorite = @recipe.favorites.find_by(user_id: current_user.id, recipe_id: params[:recipe_id])
        
        @favorite.destroy
        Turbo::StreamsChannel.broadcast_replace_to :favorite, target: "favorite_button", 
        partial: "users/recipes/favorite_empty", 
        locals: {recipe: @recipe, fav_fill: false}
        
    end

private
    def set_recipe
        @recipe = Recipe.find_by!(id: params[:recipe_id])
    end
end