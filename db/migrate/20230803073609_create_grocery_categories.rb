class CreateGroceryCategories < ActiveRecord::Migration[7.0]
  def change
    create_table :grocery_categories do |t|
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
