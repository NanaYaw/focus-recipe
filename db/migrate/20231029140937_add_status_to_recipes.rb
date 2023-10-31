class AddStatusToRecipes < ActiveRecord::Migration[7.0]
  def change
    add_column :recipes, :status, :string, :default => 'draft', :null => false
  end
end
