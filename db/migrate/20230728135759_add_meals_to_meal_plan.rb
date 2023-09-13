class AddMealsToMealPlan < ActiveRecord::Migration[7.0]
  def change
      add_column :meal_plans, :meals, :string, array:true, default: []
  end
end
