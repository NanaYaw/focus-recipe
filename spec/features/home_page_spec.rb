require "rails_helper"

RSpec.describe "Home page", type: :feature do
  it "shows the landing page and Get Started button" do
    visit root_path

    expect(page).to have_content("Healthy eating has never been so delicous")
    expect(page).to have_link("Get Started")
  end
end
