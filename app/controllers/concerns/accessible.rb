module Accessible
  extend ActiveSupport::Concern
  included do
    before_action :check_resource
  end

  protected

  def check_resource
    if user_signed_in?
      flash.clear
      redirect_to(authenticated_root_path) and return
    end
  end
end