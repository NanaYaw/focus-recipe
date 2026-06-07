require "rails_helper"

RSpec.describe MeasurementUnit, type: :model do
  it { is_expected.to have_many(:ingredients).dependent(:destroy) }
end
