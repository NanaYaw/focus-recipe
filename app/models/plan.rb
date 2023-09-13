class Plan < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true
  validates :plan_name, presence: true

  has_many :meal_plans, dependent: :destroy
  has_many :recipes, through: :meal_plans, dependent: :destroy
end
