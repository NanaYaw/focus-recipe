json.extract! plan, :id, :plan_name, :user_id, :created_at, :updated_at
json.url plan_url(plan, format: :json)
