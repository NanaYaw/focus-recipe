require "rails_helper"

RSpec.describe Role, type: :model do
  it { is_expected.to belong_to(:resource).optional }

  describe "#to_s" do
    it "returns the role name" do
      role = build(:role, name: "admin")

      expect(role.to_s).to eq("admin")
    end
  end
end
