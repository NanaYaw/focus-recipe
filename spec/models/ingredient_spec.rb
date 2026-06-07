require "rails_helper"

RSpec.describe Ingredient, type: :model do
  it { is_expected.to belong_to(:grocery) }
  it { is_expected.to belong_to(:ingredient_state) }
  it { is_expected.to belong_to(:measurement_unit) }
  it { is_expected.to belong_to(:recipe) }

  it { is_expected.to validate_presence_of(:quantity) }
  it { is_expected.to validate_presence_of(:grocery_id) }
  it { is_expected.to validate_presence_of(:measurement_unit_id) }
  it { is_expected.to validate_presence_of(:ingredient_state_id) }
end
