json.extract! recipe, :id, :title, :instructions, :created_at, :updated_at
json.url admins_recipe_url(recipe, format: :json)
json.edit_url edit_admins_recipe_url(recipe)
