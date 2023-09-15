# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

User.create(
    email: ""aa@EXAMPLE.COM"",
    password: """",
    # profile_attributes: {
    #     first_name: "Joyce",
    #     last_name: "Chau"
    # }
);

User.create(
    email: """",
    password: "afrakumaa",
    # profile_attributes: {
    #     first_name: "Sally",
    #     last_name: "Jones"
    # }
);

User.create(
    email: "rgfioghjrg@gmail.com",
    password: "rgfioghjrg",
    # profile_attributes: {
    #     first_name: "Buster",
    #     last_name: "Posey"
    # }
);




# Grocery Categories -
# Ingredient state -
# Measurement unit -
# Grocery -
# Recipe
# Ingredient

["Fresh produce", "Frozen food", "Dried goods", "Canned", "Jarred", "Seasoning", "Baking", "Pantry items"].each do |gc|
    GroceryCategory.create!(
        "name": gc
    )
end

["Diced", "Chopped", "Sliced", "spiralized", "Canned", "Peeled", "Grated", "Minced", "Fresh", "Frozen", "Cored", "Halved", "Juiced", "Cubbed", "Seeded"].each do |gc|
    IngredientState.create!(
        "name": gc
    )
end

['tsp', 'tbsp', 'cup', 'cups'].each do |mu|
    MeasurementUnit.create!(
        "name": mu
    )
end

groceries = [
    {name: "avocado", grocery_category_id: 1}, 
    {name: "tomato", grocery_category_id: 1},
    {name: "carrot", grocery_category_id: 1},
    {name: "red bell pepper", grocery_category_id: 1},
    {name: "green onion", grocery_category_id: 1},
    {name: "sesami seeds", grocery_category_id: 1},
    {name: "Spinach", grocery_category_id: 1},
    {name: "celery", grocery_category_id: 1},
    {name: "cucumber", grocery_category_id: 1},
    {name: "fresh cilantro", grocery_category_id: 1},
    {name: "garlic clove", grocery_category_id: 1},
    {name: "ginger root", grocery_category_id: 1},
    {name: "green apple", grocery_category_id: 1},
    {name: "lemon", grocery_category_id: 1},
    {name: "lime", grocery_category_id: 1},
    {name: "mint leaves", grocery_category_id: 1},
    {name: "pear", grocery_category_id: 1},
    {name: "watermelon", grocery_category_id: 1},
    {name: "basil leaves", grocery_category_id: 1},
    {name: "banna", grocery_category_id: 1},
    {name: "baby bella mushrooms", grocery_category_id: 1},
    {name: "brocolli florets", grocery_category_id: 1},
    {name: "garlic clove", grocery_category_id: 1},
    {name: "blueberries", grocery_category_id: 2},
    {name: "sweet cherries", grocery_category_id: 2},
    {name: "coconut oil", grocery_category_id: 3},
    {name: "chia seeds", grocery_category_id: 3},
    {name: "coconut milk", grocery_category_id: 4},
    {name: "sea salt", grocery_category_id: 4},
    {name: "water", grocery_category_id: 8}
]



groceries.each do |g|
    Grocery.create!(
        name: g[:name], 
        grocery_category_id: g[:grocery_category_id]
    )
end


#-----------------------------------------------------------------------------------------#

Recipe.create(
  title: "Salsa Shrimp Lettuce Wraps",
  description: "Looking for a healthy dinner that is ready in 15 minutes? These Salsa Shrimp Lettuce Wraps can be made so easily and quickly that you won’t have to wonder what’s for dinner.",
  directions: ["In a large skillet over medium heat, heat the oil. Once hot, add the garlic and shrimp. Cook 3-5 minutes or until the shrimp is pink and no longer transparent, flipping once during cooking. Remove from the heat and stir in the salsa, lime juice, and salt.",
               "Separate the lettuce leaves and fill with some of the shrimp. Top with green onion."]
  )

Recipe.create(
title: "Red Velvet Cupcakes",
description: "This mini version of the classic Red Velvet Cake is one of the more popular offerings in bakeries all across the country.",
directions: ["Preheat oven to 350 degrees F. Mix flour, cocoa powder, baking soda and salt in medium bowl. Set aside.",
                "Beat butter and sugar in large bowl with electric mixer on medium speed 5 minutes or until light and fluffy. Beat in eggs, one at a time. Mix in sour cream, milk, food color and vanilla. Gradually beat in flour mixture on low speed until just blended. Do not overbeat. Spoon batter into 30 paper-lined muffin cups, filling each cup 2/3 full.",
                "Bake 20 minutes or until toothpick inserted into cupcake comes out clean. Cool in pans on wire rack 5 minutes. Remove from pans; cool completely. Frost with Vanilla Cream Cheese Frosting."]
)

Recipe.create(
  title: "Caribbean Grilled Salmon Kabobs",
  description: "Caribbean Grilled Salmon Kabobs will take you straight to the islands with the cajun spices, fresh pineapple, bell peppers and fresh seafood! A perfect healthy grilling recipe for the summer that’s done in 20 minutes!",
  directions: ["Soak wooden skewers in water for 15-30 minutes.",
               "Preheat grill to medium high heat or 400 degrees.",
               "Pat Salmon dry and cut into 1\" cubes.",
               "In a small bowl mix cajun seasoning spice and garlic powder, stir with a spoon.",
               "Season both sides of the salmon cubes with cajun spice blend. Gently rub the seasoning in to make sure it sticks to the salmon.",
               "Alternate the red onion, pineapple, bell peppers, and salmon on the skewer until it is full. Repeat process.",
               "Spray grill grates with PAM or rub down with olive oil.",
               "Place salmon kabobs on grill and cook for 2-3 minutes per side.",
               "Remove from grill and serve!"]
)


Recipe.create(
  title: "Creamy Italian Pasta",
  description: "This Easy Creamy Italian Pasta is as cozy and familiar as my favorite cardigan. You’ll want to eat it all fall and winter long.",
  directions: ["Cook the pasta according to package directions, drain, and return to the pot.",
               "While the pasta is cooking, fry the bacon in a large skillet. When the bacon is crispy, remove it from the skillet and place it on a paper towel lined plate. Drain all but 1 Tablespoon of grease from the skillet. Add the sliced mushrooms and saute until softened.",
               "When the pasta is finished, add the evaporated milk, Parmesan cheese, and Italian seasoning packet, stirring until the cheese is melted.",
               "Stir in the mushrooms and halved cherry tomatoes. Serve the pasta with crumbled cooked bacon on top."]
  )

Recipe.create(
  title: "No-Bake Cheesecake",
  description: "This is an amazing recipe that I just threw together one day. Everyone loves it so much, it doesn't last long. This is good with any kind of canned or fresh fruit.",
  directions: ["In a small bowl, stir together the graham cracker crumbs, brown sugar and cinnamon. Add melted butter and mix well. Press into the bottom of an 8 or 10 inch springform pan. Chill until firm.",
               "In a medium bowl, beat together the cream cheese and lemon juice until soft. Add whipping cream and beat with an electric mixer until batter becomes thick. Add the sugar and continue to beat until stiff. Pour into chilled crust, and top with pie filling. Chill several hours or overnight. Just before serving, remove the sides of the springform pan."]
  )


Recipe.create(
  title: "Vanilla Ice Cream",
  description: "Use this easy recipe to make vanilla ice cream, or add your favorite flavors to it.",
  directions: ["Preheat In a saucepan or a microwave-safe container, combine cream, half-and-half and vanilla bean and seeds. On the stove or in the microwave, bring mixture to a simmer. Immediately turn off heat.",
               "Add sugar and salt and mix until sugar dissolves, about 1 minute. Taste and add more sugar and salt as needed to balance the flavors. The mixture should taste slightly too sweet when warm; the sweetness will be muted when the ice cream is frozen.",
               "Strain mixture into a container and refrigerate until very cold, at least 4 hours and preferably overnight.",
               "Churn mixture in an ice cream maker according to manufacturer's instructions. Serve immediately or transfer to an airtight container and let freeze until hard."]
  )

Recipe.create(
  title: "Buffalo Chicken Wings",
  description: "Let your palate fly away on wings of fire - easy, spicy buffalo wings!",
  directions: ["Heat the oil in a large skillet or deep fryer to 375 degrees F (190 degrees C). Deep fry chicken wings in oil until done, about 10 minutes. Remove chicken from skillet or deep fryer and drain on paper towels.",
               "Melt the butter in a large skillet. Stir in the, vinegar and hot pepper sauce. Season with salt and pepper to taste. Add cooked chicken to sauce and stir over low heat to coat. The longer the wings simmer in the sauce, the hotter they will be. Serve warm."]
)


Recipe.create(
title: "Bread Pudding",
description: "My family LOVES bread pudding, and this recipe is one that I have fine tuned to their taste It's great for breakfast or dessert and is delicious with milk poured on top! Enjoy!",
directions: ["Preheat oven to 350 degrees F (175 degrees C).",
              "Break bread into small pieces into an 8 inch square baking pan. Drizzle melted butter or margarine over bread. If desired, sprinkle with raisins.",
              "In a medium mixing bowl, combine eggs, milk, sugar, cinnamon, and vanilla. Beat until well mixed. Pour over bread, and lightly push down with a fork until bread is covered and soaking up the egg mixture.",
              "Bake in the preheated oven for 45 minutes, or until the top springs back when lightly tapped."]
)


Recipe.create(
      title: "Curried Coconut Chicken",
      description: "Curried chicken simmered in coconut milk and tomatoes makes for a mouthwatering hint of the tropics! Goes great with rice and vegetables.",
      directions: ["Season chicken pieces with salt and pepper.",
                    "Heat oil and curry powder in a large skillet over medium-high heat for two minutes. Stir in onions and garlic, and cook 1 minute more. Add chicken, tossing lightly to coat with curry oil. Reduce heat to medium, and cook for 7 to 10 minutes, or until chicken is no longer pink in center and juices run clear.",
                    "Pour coconut milk, tomatoes, tomato sauce, and sugar into the pan, and stir to combine. Cover and simmer, stirring occasionally, approximately 30 to 40 minutes."]
      )

Recipe.create(
title: "Flan",
description: "This is a quick and easy baked flan recipe that is prepared in the blender. It's great served warm or cold and has a creamy texture like custard. Slice the flan and spoon a little of the melted sugar onto the top of the slice.",
directions: ["Preheat oven to 350 degrees F (175 degrees C).",
              "In a small nonstick saucepan, heat the sugar over medium heat. Shake and swirl occasionally to distribute sugar until it is dissolved and begins to brown. Lift the pan over the heat source (4 to 6 inches) and continue to brown the sugar until it becomes a dark golden brown. You may slightly stir while cooking, but continually stirring causes the sugar to crystallize. Pour caramelized sugar into a 1 1/2 quart casserole dish or a large loaf pan, and swirl to coat the bottom of the pan evenly.",
              "In a blender, combine sweetened condensed milk, cream, milk, eggs and vanilla. Blend on high for one minute. Pour over the caramelized sugar.",
              "Place the filled casserole dish into a larger pan and add 1 inch of HOT water to the outer pan. Bake in preheated oven for 50 to 60 minutes, or until set."]
)


Recipe.create(
  title: "3-Ingredient Crock-Pot Chicken Tacos",
  description: "In just five minutes, these delicious chicken tacos are in the crock-pot and cooking away! Ridiculously easy and sure to become your go-to lifesaver!",
  directions: ["Place chicken in the bottom of the crock-pot.",
               "Sprinkle taco seasoning over chicken.",
               "Pour salsa on top.",
               "Cook on low (for 6-8 hours) or high (for 4 hours).",
               "Just before serving, use two forks to shred the chicken.",
               "Stir to evenly distribute salsa throughout chicken.",
               "Serve immediately with desired toppings."]
)


Recipe.create(
title: "Soft Oatmeal Cookies",
description: "These oatmeal cookies are very moist with a good flavor. Add a cup of raisins or nuts if you desire.",
directions: ["In a medium bowl, cream together butter, white sugar, and brown sugar. Beat in eggs one at a time, then stir in vanilla. Combine flour, baking soda, salt, and cinnamon; stir into the creamed mixture. Mix in oats. Cover, and chill dough for at least one hour.",
              "Preheat the oven to 375 degrees F (190 degrees C). Grease cookie sheets. Roll the dough into walnut sized balls, and place 2 inches apart on cookie sheets. Flatten each cookie with a large fork dipped in sugar.",
              "Bake for 8 to 10 minutes in preheated oven. Allow cookies to cool on baking sheet for 5 minutes before transferring to a wire rack to cool completely."]
)

Recipe.create(
title: "Classic Meatloaf",
description: "The secrets to this meatloaf are fresh, very finely diced vegetables that give it moisture and flavor--and a light touch in mixing together the ingredients. This hearty meatloaf is the perfect meal for cool fall and winter evenings, served with mashed potatoes and simple mushroom gravy.",
directions: ["Preheat oven to 350 degrees F (175 degrees C).",
            "In a large bowl, combine the beef, egg, onion, milk and bread OR cracker crumbs. Season with salt and pepper to taste and place in a lightly greased 5x9 inch loaf pan, OR form into a loaf and place in a lightly greased 9x13 inch baking dish.",
            "In a separate small bowl, combine the brown sugar, mustard and ketchup. Mix well and pour over the meatloaf.",
            "Bake at 350 degrees F (175 degrees C) for 1 hour."]
)

Recipe.create(
      title: "Pan Seared Salmon",
      description: "Simply seasoned with salt and pepper, these salmon fillets are pan seared with capers, and garnished with slices of lemon.",
      directions: ["Preheat a large heavy skillet over medium heat for 3 minutes.",
"Coat salmon with olive oil. Place in skillet, and increase heat to high. Cook for 3 minutes. Sprinkle with capers, and salt and pepper. Turn salmon over, and cook for 5 minutes, or until browned. Salmon is done when it flakes easily with a fork.",
                    "Transfer salmon to individual plates, and garnish with lemon slices."]
)

Recipe.create(
title: "Old Fashioned Apple Pie",
description: "Apple pie ...so American, so delicious. A true classic. Enjoy!",
directions: ["Preheat oven to 425 degrees F (220 degrees C). Melt the butter in a saucepan. Stir in flour to form a paste. Add water, white sugar and brown sugar, and bring to a boil. Reduce temperature and let simmer.",
             "Place the bottom crust in your pan. Fill with apples, mounded slightly. Cover with a lattice work crust. Gently pour the sugar and butter liquid over the crust. Pour slowly so that it does not run off.",
             "Bake 15 minutes in the preheated oven. Reduce the temperature to 350 degrees F (175 degrees C). Continue baking for 35 to 45 minutes, until apples are soft."]
)

Recipe.create(
    title: "Chicken Enchiladas",
    description: "Quick and easy creamy chicken enchiladas are sure to be a family favorite!",
    directions: ["Preheat oven to 350 degrees F (175 degrees C). Lightly grease a large baking dish.",
                "In a medium saucepan over medium heat, melt the butter and saute the green onion until tender (about 3 to 4 minutes). Add the garlic powder, then stir in the green chiles, cream of mushroom soup and sour cream. Mix well. Reserve 3/4 of this sauce and set aside. To the remaining 1/4 of the sauce in the saucepan, add the chicken and 1/2 cup of shredded Cheddar cheese. Stir together.",
                "Fill each flour tortilla with the chicken mixture and roll up. Place seam side down in the prepared baking dish.",
                "In a small bowl combine the reserved 3/4 of the sauce with the milk. Spoon this mixture over the rolled tortillas and top with the remaining 1/2 cup of shredded Cheddar cheese. Bake in the preheated oven for 30 to 35 minutes, or until cheese is bubbly."]
    )


Recipe.create(
  title: "Delicious Brownies",
  description: "Best brownies I've ever had!",
  directions: ["Preheat the oven to 325 degrees F (165 degrees C). Grease an 8x8 inch square pan.",
               "In a medium saucepan, combine the sugar, butter and water. Cook over medium heat until boiling. Remove from heat and stir in chocolate chips until melted and smooth. Mix in the eggs and vanilla. Combine the flour, baking soda and salt; stir into the chocolate mixture. Spread evenly into the prepared pan.",
               "Bake for 25 to 30 minutes in the preheated oven, until brownies set up. Do not overbake! Cool in pan and cut into squares."]
  )



Recipe.create(
      title: "Sirloin Steak with Garlic Butter",
      description: "I have never tasted any other steak that came even close to the ones made with this recipe. If you are having steak, don't skimp on flavor to save a few calories. The butter makes this steak melt in your mouth wonderful.",
      directions: ["Preheat an grill for high heat.",
                    "In a small saucepan, melt butter over medium-low heat with garlic powder and minced garlic. Set aside.",
                    "Sprinkle both sides of each steak with salt and pepper.",
                    "Grill steaks 4 to 5 minutes per side, or to desired doneness. When done, transfer to warmed plates. Brush tops liberally with garlic butter, and allow to rest for 2 to 3 minutes before serving."]
      )


Recipe.create(
  title: "Bananas Foster",
  description: "Bananas sliced in a warm cinnamon and caramel sauce with rum. Serve over ice cream!",
  directions: ["In a large, deep skillet over medium heat, melt butter. Stir in sugar, rum, vanilla and cinnamon. When mixture begins to bubble, place bananas and walnuts in pan. Cook until bananas are hot, 1 to 2 minutes. Serve at once over vanilla ice cream."]
  )


Recipe.create(
    title: "Cranberry Spinach Salad",
    description: "Everyone I have made this for RAVES about it! It's different and so easy to make!",
    directions: ["In a medium saucepan, melt butter over medium heat. Cook and stir almonds in butter until lightly toasted. Remove from heat, and let cool.",
                "In a medium bowl, whisk together the sesame seeds, poppy seeds, sugar, onion, paprika, white wine vinegar, cider vinegar, and vegetable oil. Toss with spinach just before serving.",
                "In a large bowl, combine the spinach with the toasted almonds and cranberries."]
    )


Recipe.all.map do |recipe|
    quantity = [1,2,3,4,5,6,7,8].sample
    grocery = Grocery.all.sample
    is = IngredientState.all.sample
    mu = MeasurementUnit.all.sample
    recipe.ingredients.create!(quantity: quantity, grocery_id: grocery.id, ingredient_state_id: is.id, measurement_unit_id: mu.id)
end



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

comments = [
    {comment: "I made this and it was a hit. I substituted a few things in the recipe that I didn't have and it still came out amazing!!! I also paired with with some homemade Spanish Quinoa. YUM!"
    },
    {
  comment: "I actually cooked the shrimp with the marinade in a shallow pan. That way the onions and garlic were able to be eaten as well. it was easy and wonderful!"
 },
    {
  comment: "These are the best cupcakes I've ever made! They are extremely rich in flavor and so moist. They taste like they came from a fancy bakery. The recipe is so easy and people will be very impressed and go nuts for them. I wouldn't change a thing!"
 },
    {
  comment: "These were a hit with the children in my daughters class. Soft moist melt in the mouth. Yum!"
 },
    {
  comment: "This was great! I haven't made many cakes from scratch and found this to be very easy and delicious. I will be making this again for Christmas! Everyone loved it."
 },
    {
  comment: "Very good. I was worried that the onion wouldn't be cooked, so I used canned pearl onions, which worked well. I will definitely make this again, although next time I will marinate longer, I didn't think the marinade imparted much of its flavor in only 30 minutes. Even so, I was very happy with the results."
 },
    {
  comment: "This was pretty tasty. I made this as a stir fry, adding broccoli, and used the marinade as a sauce. I had to do a chicken version for my husband as he doesn't eat salmon, and he thought it was good too."
 },
    {
  comment: "I would give this more stars if I could! WOW! We are from Miami and liken this to our favorite dish at our very favorite seafood restaurant- Captain's Tavern. We made this with grilled (frozen) yellowtail (from a catch 2 weeks ago) and served with reduced marinade on top of the fish. We accompanied it with black beans and rice (just like our favorite restaurant) and- voila!- we had one of the most GOURMET meals we've ever made at home!"
 },
    {
  comment: "My husband made the recipe prior to reading the reviews. I agree that it's bland and needed some spicing up. If he makes it again I'm sure he'll be adding some roasted garlic, salt, pepper and Italian seasoning."
 },
    {
  comment: "Really yummy and the kids gobbled it up. I did change it a bit to make it a tad healthier. I cooked the chicken with garlic and onions. I used 8oz light cream cheese and almost one whole can of chicken broth and 3/4 finely shredded cheddar cheese for the sauce, It was super yum. You omit the milk, water, and cream of chicken soup. It was GREAT"
 },
    {
  comment: "Way too much filling for a 9 inch crust but a tasty recipe nonetheless."
 },
    {
  comment: "Bland and lacked flavor"
 },
    {
  comment: "YUMMY! This will be the only recipe I will use for vanilla ice cream. It is very rich and creamy! When you scoop it out the ice cream clings to the spoon! I can't wait to try it with other flavors of pudding. I had to scale down the recipe to half and then only 3/4 of it would fit my cuisinart ice cream maker. I used one carton of egg beaters (2 eggs worth) instead of the fresh eggs and I still put in a whole teaspoon of vanilla. It was perfect!"
 },
    {
  comment: "This tastes like frozen store-bought pudding, not ice cream. The consistancy after being in the freezer is weirdly stiff yet gooey, like cold playdough. But if you like frozen pudding, you may like it."
 },
    {
  comment: "Great complement to any proteins."
 }
]

recipes = Recipe.all
users = User.all

if recipes.count > 0
    recipes.each do |recipe|
        comment = comments.sample
        user = users.sample
        stars = [1,2,3,4,5].sample

        Review.create(
            comment: comment[:comment],
            user_id: user.id,
            recipe_id: recipe.id,
            stars: stars,
        )

        #---------------------------

        # comment = comments.sample
        # parent = Review.all.sample
        # user = User.all.sample
        # stars = [1,2,3,4].sample

        # Review.create(
        #     comment: comment[:comment],
        #     user_id: user.id,
        #     recipe_id: recipe.id,
        #     parent_id: parent.id,
        #     stars: stars,
        # )

    end
end

# # comment = comments.sample
# # parent = Review.all.sample
# # user = User.all.sample
# # stars = [1,2,3].sample

# # Review.create(
# #     comment: comment[:comment],
# #     user_id: user.id,
# #     recipe_id: recipe.id,
# #     parent_id: parent.id,
# #     stars: stars,
# # )





