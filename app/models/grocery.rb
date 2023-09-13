class Grocery < ApplicationRecord
  has_many :ingredient, dependent: :destroy

  validates :name, presence: true
  validates :grocery_category_id, presence: true

  belongs_to :grocery_category
end
