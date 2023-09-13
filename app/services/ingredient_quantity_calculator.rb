class IngredientQuantityCalculator

    attr_reader :qty, :serving
    def initialize(qty, serving=1)
        @qty = qty
        @serving = serving
    end

    def call
        @qty * @serving
    end
end