FactoryBot.define do
  factory :review do
    comment { "This recipe is really tasty." }
    stars { 4 }
    association :recipe
    association :user
  end
end
