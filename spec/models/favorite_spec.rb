require "rails_helper"

RSpec.describe Favorite, type: :model do
  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:recipe) }
  it { is_expected.to validate_presence_of(:user_id) }
  it { is_expected.to validate_presence_of(:recipe_id) }

  describe "uniqueness" do
    subject { create(:favorite) }

    it { is_expected.to validate_uniqueness_of(:recipe_id).scoped_to(:user_id) }
  end
end
