class MealPlan < ApplicationRecord
  belongs_to :plan
  belongs_to :recipe, optional: true

  enum meal_type: Hash[MealType::MEAL_TYPE.collect { |type| [type, type] }], _prefix: true

  scope :cooking, -> { sum(:number_of_persons_to_be_served) || 0 }

  scope :with_plan_and_includes, ->(plan_id) {
    where(plan_id: plan_id)
      .select(:meal_type, :recipe_id, :day, :id)
      .eager_load(recipe: [:image_attachment, :reviews, :favorites, ingredients: [:grocery, :measurement_unit, :ingredient_state]])
  }

  default_scope { order(day: :asc) }

  # after_update_commit { broadcast_replace_to "mealplans_list" }
  # after_update_commit do
  #   broadcast_replace_to(:plans, target: "mealplans_list")
  # end

  # TODO: add 3 columns [days, meal_type, meals]
end
