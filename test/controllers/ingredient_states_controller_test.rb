require "test_helper"

class IngredientStatesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ingredient_state = ingredient_states(:one)
  end

  test "should get index" do
    get ingredient_states_url
    assert_response :success
  end

  test "should get new" do
    get new_ingredient_state_url
    assert_response :success
  end

  test "should create ingredient_state" do
    assert_difference("IngredientState.count") do
      post ingredient_states_url, params: { ingredient_state: { description: @ingredient_state.description, name: @ingredient_state.name, status: @ingredient_state.status } }
    end

    assert_redirected_to ingredient_state_url(IngredientState.last)
  end

  test "should show ingredient_state" do
    get ingredient_state_url(@ingredient_state)
    assert_response :success
  end

  test "should get edit" do
    get edit_ingredient_state_url(@ingredient_state)
    assert_response :success
  end

  test "should update ingredient_state" do
    patch ingredient_state_url(@ingredient_state), params: { ingredient_state: { description: @ingredient_state.description, name: @ingredient_state.name, status: @ingredient_state.status } }
    assert_redirected_to ingredient_state_url(@ingredient_state)
  end

  test "should destroy ingredient_state" do
    assert_difference("IngredientState.count", -1) do
      delete ingredient_state_url(@ingredient_state)
    end

    assert_redirected_to ingredient_states_url
  end
end
