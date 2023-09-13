class CreateIngredients < ActiveRecord::Migration[7.0]
  def change
    create_table :ingredients do |t|
      t.decimal :quantity, precision: 2, scale: 1
      t.references :grocery, null: false, foreign_key: true
      t.references :ingredient_state, null: false, foreign_key: true
      t.references :measurement_unit, null: false, foreign_key: true
      t.references :recipe, null: false, foreign_key: true

      t.timestamps
    end

    
  end
end
