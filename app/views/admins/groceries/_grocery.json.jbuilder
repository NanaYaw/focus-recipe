json.extract! grocery, :id, :name, :description, :created_at, :updated_at
json.url grocery_category_url(grocery, format: :json)
