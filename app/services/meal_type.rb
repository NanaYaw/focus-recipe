class MealType 
    MEAL_TYPE = %w(breakfast lunch snack dinner extras).freeze

    attr_reader :name 

    def initialize(name)
        @name = name
    end

    def meal_type
        MEAL_TYPE[name]
    end

    def ==(other)
        name == other.name
    end

    class << self
        def to_select
            MEAL_TYPE.map{|meal_type| meal_type}
        end
    end

    def valid?
        MEAL_TYPE.include?(name)
    end

    def to_s
        name.capitalize
    end

end