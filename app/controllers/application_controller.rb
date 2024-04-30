class ApplicationController < ActionController::Base
    include Pagy::Backend
    
    include ActiveStorage::SetCurrent
    # before_action :authenticate_user!

    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    

    helper_method :breadcrumbs

    def breadcrumbs
        @breadcrumbs ||= []
    end

    def add_breadcrumb(name, path = nil)
        breadcrumbs << Breadcrumb.new(name, path)
    end


    private
    def user_not_authorized
        flash[:alert] = "You are not authorized to perform this action."
        redirect_back(fallback_location: root_path)
    end
end
