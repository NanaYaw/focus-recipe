class MealPlan < ApplicationRecord
  belongs_to :plan
  belongs_to :recipe, optional: true
 
  enum meal_type: Hash[MealType::MEAL_TYPE.collect{|type| [type, type]}], _prefix: true

  default_scope { order(day: :asc) }

  # after_update_commit { broadcast_replace_to "mealplans_list" }
  # after_update_commit do
  #   broadcast_replace_to(:plans, target: "mealplans_list")
  # end

  # TODO: add 3 columns [days, meal_type, meals]
end
