class CreateMeasurementUnits < ActiveRecord::Migration[7.0]
  def change
    create_table :measurement_units do |t|
      t.string :name
      t.text :description
      t.string :status

      t.timestamps
    end
  end
end
