require "rails_helper"

RSpec.describe Review, type: :model do
  it { is_expected.to belong_to(:recipe) }
  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:parent).class_name("Review").optional }
  it { is_expected.to have_many(:replies).class_name("Review").dependent(:destroy) }
  it { is_expected.to validate_length_of(:comment).is_at_least(4) }
  it { is_expected.to validate_inclusion_of(:stars).in_array(Review::STARS).with_message("Must be between 1 and 5 stars") }

  describe ".average_stars" do
    it "returns a rounded average of review stars" do
      create(:review, stars: 4)
      create(:review, stars: 5)

      expect(Review.average_stars).to eq(4.5)
    end
  end
end
