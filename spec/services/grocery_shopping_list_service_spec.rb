require "rails_helper"

RSpec.describe GroceryShoppingListService, type: :service do
  describe "#grocery_list" do
    it "groups ingredients by grocery category" do
      category = create(:grocery_category, name: "Produce")
      grocery = create(:grocery, grocery_category: category)
      unit = create(:measurement_unit, name: "Cup")
      state = create(:ingredient_state, name: "Fresh")
      recipe = create(:recipe)
      ingredient = create(:ingredient, recipe: recipe, grocery: grocery, measurement_unit: unit, ingredient_state: state, quantity: 1.0)

      result = GroceryShoppingListService.new([recipe.id]).grocery_list

      expect(result.keys).to contain_exactly("Produce")
      expect(result["Produce"]).to include(ingredient)
    end
  end
end
