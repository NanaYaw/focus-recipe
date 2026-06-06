require "rails_helper"

RSpec.describe Recipe, type: :model do
  subject { build(:recipe) }

  it { is_expected.to validate_presence_of(:title) }
  it { is_expected.to belong_to(:recipe_category) }
  it { is_expected.to have_many(:ingredients).dependent(:destroy) }
  it { is_expected.to have_many(:reviews).dependent(:destroy) }

  describe "average_stars" do
    it "returns 0.0 when there are no reviews" do
      expect(build(:recipe).average_stars).to eq(0.0)
    end

    it "returns a precomputed average when set" do
      recipe = build(:recipe)
      recipe.precompute_average_stars(4.3)

      expect(recipe.average_stars).to eq(4.3)
    end
  end
end
