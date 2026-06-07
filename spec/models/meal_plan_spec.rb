require "rails_helper"

RSpec.describe MealPlan, type: :model do
  it { is_expected.to belong_to(:plan) }
  it { is_expected.to belong_to(:recipe).optional }

  describe "meal_type enum" do
    it "allows valid meal types" do
      meal_plan = build(:meal_plan, meal_type: MealType::MEAL_TYPE.first)

      expect(meal_plan).to be_valid
      expect(meal_plan.meal_type).to eq(MealType::MEAL_TYPE.first)
    end
  end
end
