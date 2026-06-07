class GroceryShoppingListService
    
    def initialize(recipe_ids)
        @recipe_ids = recipe_ids
    end
    

    def grocery_list
          ingredients.group_by { |i| i.grocery.grocery_category.name }
    end

    def recipe_list
        ingredients.group_by { |t| t.grocery.grocery_category.name }   
    end

    private

    def ingredients
        @ingredients ||= Ingredient.where(recipe_id: @recipe_ids)
            .includes(:measurement_unit, :ingredient_state, :recipe, grocery: :grocery_category)
    end


end
