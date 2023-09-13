class Ingredient < ApplicationRecord
  belongs_to :grocery
  belongs_to :ingredient_state
  belongs_to :measurement_unit
  belongs_to :recipe

  validates :quantity, presence: true, uniqueness: {scope: [:grocery_id, :measurement_unit_id, :ingredient_state_id, :recipe_id]}

  validates :measurement_unit_id, presence: true, uniqueness: {scope: [:quantity, :grocery_id, :ingredient_state_id, :recipe_id]}
  validates :grocery_id, presence: true, uniqueness: {scope: [:quantity, :measurement_unit_id, :ingredient_state_id, :recipe_id]}
  validates :ingredient_state_id, presence: true, uniqueness: {scope: [:quantity, :measurement_unit_id, :grocery_id, :recipe_id]}

  attribute :quantity, :decimal, precision: 1

end
