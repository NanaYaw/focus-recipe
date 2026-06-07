require "rails_helper"

RSpec.describe User, type: :model do
  it { is_expected.to have_many(:reviews) }
  it { is_expected.to have_one(:profile) }

  describe "profile association" do
    it "builds a profile when none exists" do
      user = build(:user)

      expect(user.profile).to be_present
      expect(user.profile).to be_a(Profile)
    end
  end
end
