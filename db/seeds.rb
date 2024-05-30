# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
# ActiveRecord::Base.connection_pool.with_connection do |conn|
#   conn.execute("TRUNCATE ingredients, groceries, grocery_categories, ingredient_states, measurement_units, recipes, reviews, favorites  RESTART IDENTITY")
# end

# User.create(
#     email: ""aa@EXAMPLE.COM"",
#     password: """",
#     # password_confirmation: """",
#     # profile_attributes: {
#     #     first_name: "Joyce",
#     #     last_name: "Chau"
#     # }
# );

# 20.times do |num|
#   User.create(
#     email: Faker::Internet.email,
#     password: "rgfioghjrg",
#     # password_confirmation: "rgfioghjrg",
#   );
# end

# Grocery Categories -
# Ingredient state -
# Measurement unit -
# Grocery -
# Recipe
# Ingredient

["Fresh produce", "Frozen food", "Dried goods", "Canned", "Jarred", "Seasoning", "Baking", "Pantry items"].each do |gc|
  GroceryCategory.create!(
    name: gc
  )
end

["Diced", "Chopped", "Sliced", "spiralized", "Canned", "Peeled", "Grated", "Minced", "Fresh", "Frozen", "Cored", "Halved", "Juiced", "Cubbed", "Seeded"].each do |gc|
  IngredientState.create!(
    name: gc
  )
end

["tsp", "tbsp", "cup", "cups"].each do |mu|
  MeasurementUnit.create!(
    name: mu
  )
end

grocery = GroceryCategory.all

if grocery.length > 0
  40.times.each do |i|
    Grocery.create!(
      name: Faker::Food.ingredient,
      grocery_category_id: grocery.sample.id
    )
  end
end

#-----------------------------------------------------------------------------------------#

10.times.each do |i|
  RecipeCategory.create!(
    name: Faker::Food.ethnic_category
  )
end

recipes_categories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

20.times.each do |i|
  Recipe.create(
    title: Faker::Food.dish,
    description: Faker::Food.description,
    directions: ["In a medium saucepan, melt butter over medium heat. Cook and stir almonds in butter until lightly toasted. Remove from heat, and let cool.",
      "In a medium bowl, whisk together the sesame seeds, poppy seeds, sugar, onion, paprika, white wine vinegar, cider vinegar, and vegetable oil. Toss with spinach just before serving.",
      "In a large bowl, combine the spinach with the toasted almonds and cranberries."],
    recipe_category_id: recipes_categories.sample,
    status: "published"
  )
end

# RECIPE INGREDENTS --------------------------------
recipes = Recipe.all
users = User.all

flow = [4, 5, 6, 7, 8]

if recipes.count > 0 && users.count > 0

  recipes.each_with_index do |recipe, index|
    flow.sample.times do
      quantity = [1, 2, 3, 4, 5, 6, 7, 8].sample
      grocery = Grocery.all.sample
      is = IngredientState.all.sample
      mu = MeasurementUnit.all.sample
      recipe.ingredients.create!(quantity: quantity, grocery_id: grocery.id, ingredient_state_id: is.id, measurement_unit_id: mu.id)
    end

    #-------------------------------------------

    file = "app/assets/images/recipes/#{index + 1}.jpg"
    filename = "#{index + 1}.jpg"

    recipe.image.attach(
      io: File.open(File.join(Rails.root, file)),
      filename: filename
    )
  end

  # FAVORITES -------------------------------------
  Favorite.create(user_id: 1, recipe_id: 1)
  Favorite.create(user_id: 1, recipe_id: 3)
  Favorite.create(user_id: 1, recipe_id: 4)
  Favorite.create(user_id: 1, recipe_id: 5)
  Favorite.create(user_id: 1, recipe_id: 10)
  Favorite.create(user_id: 2, recipe_id: 1)
  Favorite.create(user_id: 2, recipe_id: 2)
  Favorite.create(user_id: 2, recipe_id: 12)
  Favorite.create(user_id: 2, recipe_id: 13)
  Favorite.create(user_id: 2, recipe_id: 14)

  # REVIEWS ---------------------------------------

  numbers = [1, 2, 3, 4, 5]
  recipes.each do |recipe|
    (1..7).each do |i|
      # comment = comments.sample
      stars = [1, 2, 3, 4].sample

      Review.create(
        comment: Faker::Lorem.paragraph(sentence_count: numbers.sample),
        user_id: users.sample.id,
        recipe_id: recipe.id,
        stars: stars
      )
    end
  end

  recipes.each do |recipe|
    (1..4).each do |i|
      stars = [1, 2, 3, 4].sample
      parent = Review.all.sample

      Review.create(
        comment: Faker::Lorem.paragraph(sentence_count: numbers.sample),
        user_id: users.sample.id,
        recipe_id: recipe.id,
        parent_id: parent.id,
        stars: stars
      )
    end
  end
end
