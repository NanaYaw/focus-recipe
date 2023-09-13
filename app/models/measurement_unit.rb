class MeasurementUnit < ApplicationRecord
    has_many :ingredients, dependent: :destroy
end
