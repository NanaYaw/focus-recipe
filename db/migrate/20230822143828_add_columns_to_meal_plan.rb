class AddColumnsToMealPlan < ActiveRecord::Migration[7.0]
  def change
    add_reference :meal_plans, :recipe, null: true, foreign_key: true
    add_column :meal_plans, :day, :string
  end
end
