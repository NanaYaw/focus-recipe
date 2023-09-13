module Modal
    class ModalComponent < ViewComponent::Base
        include Turbo::FramesHelper

        attr_reader :name, :title, :hidden

        def initialize(title:, hidden: true)
            super
            @name = name,
            @hidden = hidden
            @title = title
        end
    end
end