module Users::RecipesHelper
    def average_stars(recipe)
        if recipe.average_stars.zero?
            content_tag(:strong, "No reviews")
        else
            pluralize(number_with_precision(recipe.average_stars, precision: 1), "star")
        end
    end
end
