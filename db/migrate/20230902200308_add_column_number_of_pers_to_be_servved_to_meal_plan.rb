class AddColumnNumberOfPersToBeServvedToMealPlan < ActiveRecord::Migration[7.0]
  def change
    add_column :meal_plans, :number_of_persons_to_be_served, :integer, default: 1
  end
end
