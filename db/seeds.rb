# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).


# User.create(
#     email: ""aa@EXAMPLE.COM"",
#     password: """",
#     # profile_attributes: {
#     #     first_name: "Joyce",
#     #     last_name: "Chau"
#     # }
# );

# # Admin.create(
# #     email: ""aa@EXAMPLE.COM"",
# #     password: """",
# #     # profile_attributes: {
# #     #     first_name: "Joyce",
# #     #     last_name: "Chau"
# #     # }
# # );

# User.create(
#     email: """",
#     password: "afrakumaa",
#     # profile_attributes: {
#     #     first_name: "Sally",
#     #     last_name: "Jones"
#     # }
# );

# User.create(
#     email: "rgfioghjrg@gmail.com",
#     password: "rgfioghjrg",
#     # profile_attributes: {
#     #     first_name: "Buster",
#     #     last_name: "Posey"
#     # }
# );

20.times do |num|
  User.create(
    email: Faker::Internet.email,
    password: "rgfioghjrg",
  );
end




# Grocery Categories -
# Ingredient state -
# Measurement unit -
# Grocery -
# Recipe
# Ingredient

# ["Fresh produce", "Frozen food", "Dried goods", "Canned", "Jarred", "Seasoning", "Baking", "Pantry items"].each do |gc|
#     GroceryCategory.create!(
#         "name": gc
#     )
# end

# ["Diced", "Chopped", "Sliced", "spiralized", "Canned", "Peeled", "Grated", "Minced", "Fresh", "Frozen", "Cored", "Halved", "Juiced", "Cubbed", "Seeded"].each do |gc|
#     IngredientState.create!(
#         "name": gc
#     )
# end

# ['tsp', 'tbsp', 'cup', 'cups'].each do |mu|
#     MeasurementUnit.create!(
#         "name": mu
#     )
# end

# groceries = [
#     {name: "avocado", grocery_category_id: 1}, 
#     {name: "tomato", grocery_category_id: 1},
#     {name: "carrot", grocery_category_id: 1},
#     {name: "red bell pepper", grocery_category_id: 1},
#     {name: "green onion", grocery_category_id: 1},
#     {name: "sesami seeds", grocery_category_id: 1},
#     {name: "Spinach", grocery_category_id: 1},
#     {name: "celery", grocery_category_id: 1},
#     {name: "cucumber", grocery_category_id: 1},
#     {name: "fresh cilantro", grocery_category_id: 1},
#     {name: "garlic clove", grocery_category_id: 1},
#     {name: "ginger root", grocery_category_id: 1},
#     {name: "green apple", grocery_category_id: 1},
#     {name: "lemon", grocery_category_id: 1},
#     {name: "lime", grocery_category_id: 1},
#     {name: "mint leaves", grocery_category_id: 1},
#     {name: "pear", grocery_category_id: 1},
#     {name: "watermelon", grocery_category_id: 1},
#     {name: "basil leaves", grocery_category_id: 1},
#     {name: "banna", grocery_category_id: 1},
#     {name: "baby bella mushrooms", grocery_category_id: 1},
#     {name: "brocolli florets", grocery_category_id: 1},
#     {name: "garlic clove", grocery_category_id: 1},
#     {name: "blueberries", grocery_category_id: 2},
#     {name: "sweet cherries", grocery_category_id: 2},
#     {name: "coconut oil", grocery_category_id: 3},
#     {name: "chia seeds", grocery_category_id: 3},
#     {name: "coconut milk", grocery_category_id: 4},
#     {name: "sea salt", grocery_category_id: 4},
#     {name: "water", grocery_category_id: 8}
# ]



# groceries.each do |g|
#     Grocery.create!(
#         name: g[:name], 
#         grocery_category_id: g[:grocery_category_id]
#     )
# end


#-----------------------------------------------------------------------------------------#



# Recipe.create(
#     title: "Cranberry Spinach Salad",
#     description: "Everyone I have made this for RAVES about it! It's different and so easy to make!",
#     directions: ["In a medium saucepan, melt butter over medium heat. Cook and stir almonds in butter until lightly toasted. Remove from heat, and let cool.",
#                 "In a medium bowl, whisk together the sesame seeds, poppy seeds, sugar, onion, paprika, white wine vinegar, cider vinegar, and vegetable oil. Toss with spinach just before serving.",
#                 "In a large bowl, combine the spinach with the toasted almonds and cranberries."]
#     )



# RECIPE INGREDENTS
# recipe = Recipe.all

# if( recipe.count > 0 )

#   recipe.each_with_index do |recipe, index|
#       quantity = [1,2,3,4,5,6,7,8].sample
#       grocery = Grocery.all.sample
#       is = IngredientState.all.sample
#       mu = MeasurementUnit.all.sample
#       recipe.ingredients.create!(quantity: quantity, grocery_id: grocery.id, ingredient_state_id: is.id, measurement_unit_id: mu.id)
#   end
# end

# RECIPE IMAGES
# if( recipe.count > 0 )
#   recipe.each_with_index do |recipe, index|
#     file = "app/assets/images/recipes/#{index + 1}.jpg"
#     filename = "#{index + 1}.jpg"

#     recipe.image.attach(
#       io: File.open(File.join(Rails.root, file)),
#       filename: filename
#     )
#   end
# end



# Favorite.create(user_id: 1, recipe_id: 1)
# Favorite.create(user_id: 1, recipe_id: 3)
# Favorite.create(user_id: 1, recipe_id: 4)
# Favorite.create(user_id: 1, recipe_id: 5)
# Favorite.create(user_id: 1, recipe_id: 10)
# Favorite.create(user_id: 2, recipe_id: 1)
# Favorite.create(user_id: 2, recipe_id: 2)
# Favorite.create(user_id: 2, recipe_id: 12)
# Favorite.create(user_id: 2, recipe_id: 13)
# Favorite.create(user_id: 2, recipe_id: 14)


# recipes = Recipe.all
# users = User.all

# numbers = [1,2,3,4,5,]

# if recipes.count > 0
#     recipes.each do |recipe|
#         # comment = comments.sample
#         user = users.sample
#         stars = [1,2,3,4].sample
#         # parent = Review.all.sample

#         Review.create(
#             comment: Faker::Lorem.paragraph(sentence_count: numbers.sample),
#             user_id: user.id,
#             recipe_id: recipe.id,
#             stars: stars,
#         )


#         # Review.create(
#         #     comment: Faker::Lorem.paragraph(sentence_count: numbers.sample),
#         #     user_id: user.id,
#         #     recipe_id: recipe.id,
#         #     parent_id: parent.id,
#         #     stars: stars,
#         # )

#         #---------------------------

#     end
# end





