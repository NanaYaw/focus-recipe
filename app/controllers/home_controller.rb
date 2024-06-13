class HomeController < ApplicationController
    before_action :authenticate_user!, except: [:index, :testmailer]

    def index
        @recipes = Recipe.where(status: 'published').includes(:reviews, :ingredients, :favorites, :meal_plans,  image_attachment: :blob).limit(12)
    end

  
end