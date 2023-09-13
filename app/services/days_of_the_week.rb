class DaysOfTheWeek
    DAYS_OF_THE_WEEK = %w(sunday monday tuesday wednesday thursday friday saturday).freeze

    attr_reader :name

    def initialize(name)
        @name = name 
    end

    def day
        DAYS_OF_THE_WEEK[name]
    end

    def ==(other)
        name == other.name
    end

    class << self
        def to_select_key
            DAYS_OF_THE_WEEK.map{|key| key[0].capitalize  }
        end

        def to_select_value
            DAYS_OF_THE_WEEK.map{|value| value[1].capitalize  }
        end
    end

    def valid?
        DAYS_OF_THE_WEEK.include?(name)
    end

    def to_s
        name.capitalize
    end 
    
end
