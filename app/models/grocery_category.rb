class GroceryCategory < ApplicationRecord

    validates :name, presence: true

    has_many :groceries


    def to_s
        name
    end
end
