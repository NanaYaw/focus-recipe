require "application_system_test_case"

class MeasurementUnitsTest < ApplicationSystemTestCase
  setup do
    @measurement_unit = measurement_units(:one)
  end

  test "visiting the index" do
    visit measurement_units_url
    assert_selector "h1", text: "Measurement units"
  end

  test "should create measurement unit" do
    visit measurement_units_url
    click_on "New measurement unit"

    fill_in "Description", with: @measurement_unit.description
    fill_in "Name", with: @measurement_unit.name
    fill_in "Status", with: @measurement_unit.status
    click_on "Create Measurement unit"

    assert_text "Measurement unit was successfully created"
    click_on "Back"
  end

  test "should update Measurement unit" do
    visit measurement_unit_url(@measurement_unit)
    click_on "Edit this measurement unit", match: :first

    fill_in "Description", with: @measurement_unit.description
    fill_in "Name", with: @measurement_unit.name
    fill_in "Status", with: @measurement_unit.status
    click_on "Update Measurement unit"

    assert_text "Measurement unit was successfully updated"
    click_on "Back"
  end

  test "should destroy Measurement unit" do
    visit measurement_unit_url(@measurement_unit)
    click_on "Destroy this measurement unit", match: :first

    assert_text "Measurement unit was successfully destroyed"
  end
end
