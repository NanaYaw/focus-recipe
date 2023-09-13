class CreateMealPlans < ActiveRecord::Migration[7.0]
  def change
    create_table :meal_plans do |t|
      t.belongs_to :plan, null: false, foreign_key: true

      t.timestamps
    end
  end
end
