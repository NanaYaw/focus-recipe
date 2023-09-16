class Plan < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true
  validates :plan_name, presence: true, uniqueness: {scope: :user}

  has_many :meal_plans, dependent: :destroy
  has_many :recipes, through: :meal_plans, dependent: :destroy

  # scope :select_number_of_plans, ->(number) { where: {first: number}}



end
