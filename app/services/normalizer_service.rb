  class NormalizerService
    def initialize(plan_id)
      @plan_id = plan_id
    end

    def call
      fetch_meal_plans
    end

    def grid_normalizer
      meal_plans = fetch_meal_plans
      normalize_meal_plans(meal_plans)
    end

    def recipe_ids
      meal_plans = fetch_meal_plans
      meal_plans.flat_map { |_, plans| plans.map(&:recipe_id) }.uniq
    end

    private

    # Fetch meal plans using the scope
    def fetch_meal_plans
      ::MealPlan.with_plan_and_includes(@plan_id).group_by(&:meal_type)
    end

    # Normalize meal plans to include all meal types and days
    def normalize_meal_plans(meal_plans)
      MealType::MEAL_TYPE.each_with_object({}) do |meal_type, result|
        days_hash = DaysOfTheWeek::DAYS_OF_THE_WEEK.map { |day| [day, nil] }.to_h

        if meal_plans[meal_type]
          meal_plans[meal_type].each do |plan|
            days_hash[plan.day] = plan
          end
        end

        result[meal_type] = days_hash
      end
    end
  end
