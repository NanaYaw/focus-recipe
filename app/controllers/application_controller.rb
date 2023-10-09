class ApplicationController < ActionController::Base
    include ActiveStorage::SetCurrent
    # before_action :authenticate_user!
    
    include Pagy::Backend

    helper_method :breadcrumbs

    def breadcrumbs
        @breadcrumbs ||= []
    end

    def add_breadcrumb(name, path = nil)
        breadcrumbs << Breadcrumb.new(name, path)
    end
end
