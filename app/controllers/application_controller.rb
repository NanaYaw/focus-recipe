class ApplicationController < ActionController::Base
    include Pagy::Backend
    
    include ActiveStorage::SetCurrent
    # before_action :authenticate_user!
    

    helper_method :breadcrumbs

    def breadcrumbs
        @breadcrumbs ||= []
    end

    def add_breadcrumb(name, path = nil)
        breadcrumbs << Breadcrumb.new(name, path)
    end
end
