class GroceryShoppingList
    
    def initialize(recipe_ids)
        @recipe_ids = recipe_ids
    end
    

    def grocery_list
        Ingredient.where(recipe_id: @recipe_ids).includes(:grocery, :measurement_unit, :ingredient_state, :recipe).group_by{|t| t.grocery.grocery_category.name }
    end
    def recipe_list
        Ingredient.where(recipe_id:@recipe_ids).includes(:grocery, :measurement_unit, :ingredient_state, :recipe).group_by{|t| t.grocery.grocery_category.name }
    end

end
