require "application_system_test_case"

class IngredientStatesTest < ApplicationSystemTestCase
  setup do
    @ingredient_state = ingredient_states(:one)
  end

  test "visiting the index" do
    visit ingredient_states_url
    assert_selector "h1", text: "Ingredient states"
  end

  test "should create ingredient state" do
    visit ingredient_states_url
    click_on "New ingredient state"

    fill_in "Description", with: @ingredient_state.description
    fill_in "Name", with: @ingredient_state.name
    fill_in "Status", with: @ingredient_state.status
    click_on "Create Ingredient state"

    assert_text "Ingredient state was successfully created"
    click_on "Back"
  end

  test "should update Ingredient state" do
    visit ingredient_state_url(@ingredient_state)
    click_on "Edit this ingredient state", match: :first

    fill_in "Description", with: @ingredient_state.description
    fill_in "Name", with: @ingredient_state.name
    fill_in "Status", with: @ingredient_state.status
    click_on "Update Ingredient state"

    assert_text "Ingredient state was successfully updated"
    click_on "Back"
  end

  test "should destroy Ingredient state" do
    visit ingredient_state_url(@ingredient_state)
    click_on "Destroy this ingredient state", match: :first

    assert_text "Ingredient state was successfully destroyed"
  end
end
