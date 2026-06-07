require "rails_helper"

RSpec.describe RecipeCategory, type: :model do
  it { is_expected.to have_many(:recipes) }
  it { is_expected.to validate_presence_of(:name) }
end
