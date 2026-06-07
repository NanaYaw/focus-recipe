FactoryBot.define do
  factory :meal_plan do
    association :plan
    association :recipe
    meal_type { MealType::MEAL_TYPE.first }
    day { "Monday" }
    number_of_persons_to_be_served { 2 }
  end
end
