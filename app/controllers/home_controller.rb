class HomeController < ApplicationController
    before_action :authenticate_user!, except: :index

    def index
        MealType.to_select.map do |type|
            @lunch = type.capitalize
        end
        
        # @day = DaysOfTheWeek.to_select_value
        bb = ['qwerty', 'asdfgh', 'hjfg']
        @cc = Hash[bb.collect {|tt| [tt, 1]}]
        
    end
end