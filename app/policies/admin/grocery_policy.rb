class Admin::GroceryPolicy < ApplicationPolicy
    attr_reader :user, :post

    def initialize(user, post)
        @user = user
        @post = post
    end
  
    def destroy?
        user.has_role?(:admin)
    end
end