class AddIndexToIngredients < ActiveRecord::Migration[7.0]
  def change
   add_index :ingredients, [:quantity, :grocery_id, :ingredient_state_id, :measurement_unit_id, :recipe_id],  name: index_name, unique: true
  end

  def index_name
    'ingredients_index'
  end
end
