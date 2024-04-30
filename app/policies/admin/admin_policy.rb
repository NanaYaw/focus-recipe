class Admin::AdminPolicy < ApplicationPolicy
    attr_reader :user, :post

    def initialize(user, post)
        @user = user
        @post = post
    end
  
    def index?
        user.has_role?(:admin)
    end

    def edit?
        user.has_role?(:admin)
    end
   
    def destroy?
        user.has_role?(:admin)
    end
end