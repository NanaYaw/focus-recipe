require "rails_helper"

RSpec.describe GroceryCategory, type: :model do
  it { is_expected.to have_many(:groceries) }
  it { is_expected.to validate_presence_of(:name) }

  describe "#to_s" do
    it "returns the category name" do
      category = build(:grocery_category, name: "Produce")

      expect(category.to_s).to eq("Produce")
    end
  end
end
