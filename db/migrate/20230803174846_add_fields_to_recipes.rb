class AddFieldsToRecipes < ActiveRecord::Migration[7.0]
  def change
    add_column :recipes, :average_rating, :integer
    add_column :recipes, :directions, :text,  array:true, default: []
    add_column :recipes, :description, :text
  end
end
