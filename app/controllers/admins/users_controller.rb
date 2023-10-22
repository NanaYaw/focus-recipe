class Admins::UsersController < DashboardsController
 
  # before_action :require_tenant_admin, only: %i[invite edit update destroy]

  def index
    @pagy, @users = pagy(Admin.all)
  end




  
  private

  
  # def require_tenant_admin
  #   unless @current_member.admin?
  #     redirect_to members_path, alert: "You are not authorized to invite, edit, update, destory members"
  #   end
  # end
end
