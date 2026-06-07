FactoryBot.define do
  factory :plan do
    plan_name { "Weekly Plan" }
    association :user
  end
end
