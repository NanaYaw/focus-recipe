class AddRecipeCategoryToRecipes < ActiveRecord::Migration[7.0]
  def change
    add_column :recipes, :recipe_category_id, :integer, default: 1
  end
end
