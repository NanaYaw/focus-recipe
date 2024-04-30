class DashboardsController < ApplicationController
    include Pundit::Authorization
    layout 'application_admin'
    
    def pundit_user
        current_admin
    end

    def index
    end
end