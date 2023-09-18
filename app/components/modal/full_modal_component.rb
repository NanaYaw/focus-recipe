module Modal
    class FullModalComponent < Modal::ModalComponent

        attr_reader :overflow

        def initialize(title:, overflow: false)
            super(title: title)
            @overflow = overflow
        end
    end
end