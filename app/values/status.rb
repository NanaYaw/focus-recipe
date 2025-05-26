class Status 
    STATUS = %w(active pending draft  deleted).freeze

    attr_reader :name 

    def initialize(name)
        @name = name
    end

    def meal_type
        STATUS[name]
    end

    def ==(other)
        name == other.name
    end

    class << self
        def to_select
            STATUS.map{|status| status}
        end
    end

    def valid?
        STATUS.include?(name)
    end

    def to_s
        name.capitalize
    end

end