require "rails_helper"

RSpec.describe Plan, type: :model do
  subject { build(:plan, user: create(:user)) }

  it { is_expected.to belong_to(:user) }
  it { is_expected.to have_many(:meal_plans).dependent(:destroy) }
  it { is_expected.to have_many(:recipes).through(:meal_plans).dependent(:destroy) }
  it { is_expected.to validate_presence_of(:user_id) }
  it { is_expected.to validate_presence_of(:plan_name) }
  it { is_expected.to validate_uniqueness_of(:plan_name).scoped_to(:user_id) }
end
