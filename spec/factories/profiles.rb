FactoryBot.define do
  factory :profile do
    first_name { "Jane" }
    last_name { "Doe" }
    phone { "+1234567890" }
    description { "A short profile description." }
    association :user
  end
end
