require "rails_helper"

RSpec.describe Grocery, type: :model do
  it { is_expected.to belong_to(:grocery_category) }
  it { is_expected.to have_many(:ingredient).dependent(:destroy) }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:grocery_category_id) }
end
