json.extract! meal_plan, :id, :plan_id, :recipe_id, :created_at, :updated_at
json.url meal_plan_url(meal_plan, format: :json)
