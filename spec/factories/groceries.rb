FactoryBot.define do
  factory :grocery do
    name { "Tomato" }
    description { "Fresh tomato" }
    association :grocery_category
  end
end
