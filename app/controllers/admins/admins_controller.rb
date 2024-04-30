class Admins::AdminsController < DashboardsController
  before_action :set_admin_user, only: %i[edit update destroy]
  before_action :set_params, only: %i[update]

  def index
    @users = Admin.all 
    authorize [:admin, current_admin]
    @pagy, @users = pagy(@users)
  end


  def edit
    authorize [:admin, @users]
  end
  
  
  def update
    authorize [:admin, @users]
    if @users.update!(set_params)
      redirect_to admins_url, notice: 'Roles updated successfully'
    end
  end

  
  private

  def set_admin_user
    @users = Admin.find(params[:id])
  end

  def set_params
    params.require(:admin).permit(role_ids: [])
  end

  
  # def require_tenant_admin
  #   unless @current_member.admin?
  #     redirect_to members_path, alert: "You are not authorized to invite, edit, update, destory members"
  #   end
  # end
end
