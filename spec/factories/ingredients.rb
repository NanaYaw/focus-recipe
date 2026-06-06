FactoryBot.define do
  factory :ingredient do
    quantity { 1.0 }
    association :grocery
    association :ingredient_state
    association :measurement_unit
    association :recipe
  end
end
