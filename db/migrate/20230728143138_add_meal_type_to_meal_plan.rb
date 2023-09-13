class AddMealTypeToMealPlan < ActiveRecord::Migration[7.0]
  def change
    add_column :meal_plans, :meal_type, :string
  end
end
