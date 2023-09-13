class IngredientState < ApplicationRecord
    has_many :ingredients, dependent: :destroy
end
