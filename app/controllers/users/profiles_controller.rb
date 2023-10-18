class Users::ProfilesController < ApplicationController
    # before_action :set_profile
    before_action :set_permission, only: %i[:show, :edit, :update]

    def show
        @profile = current_user.profile
    end


    def edit
        @profile = current_user.profile
    end

    def update
        # p "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
        # p current_user.profile.update(set_permission)
        # p "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
        respond_to do |format|
            if current_user.profile.update(set_permission)
                format.html { redirect_to profile_url(current_user), notice: "Recipe was successfully updated." }
                format.json { render :show, status: :ok, location: @profile }
            else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @profile.errors, status: :unprocessable_entity }
            end
        end
    end

    def create
        @profile = current_user.build_profile(params[:profile])

        respond_to do |format|
            if @profile.save
                format.html { redirect_to @profile, flash[:notice] = 'User profile was successfully created.' }
                format.json { render json: @profile, status: :created, location: @profile }
            else
                format.html { render action: "new" }
                format.json { render json: @profile.errors, status: :unprocessable_entity }
            end
        end
    end

    
    private

    # def set_profile
    #     profile = User.find(params[:id])
    #     @profile = profile.profile
    # end

    def set_permission
        params.require(:profile).permit(:first_name, :last_name, :phone, :user_profile_image)
    end
    
end