class CreatePlans < ActiveRecord::Migration[7.0]
  def change
    create_table :plans do |t|
      t.string :plan_name
      t.belongs_to :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
