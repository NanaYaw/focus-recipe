class Admin < ApplicationRecord
  rolify

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :recoverable, :rememberable, :validatable

  after_create :assign_default_role

  private

  def assign_default_role
    add_role(:author) if roles.blank?
  end
end
