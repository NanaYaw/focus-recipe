FactoryBot.define do
  factory :recipe do
    title { "Fresh Veggie Bowl" }
    description { "A simple healthy recipe." }
    association :recipe_category
    status { "published" }
  end
end
