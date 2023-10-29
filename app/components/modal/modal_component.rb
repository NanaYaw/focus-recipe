module Modal
    class ModalComponent < ViewComponent::Base
        include Turbo::FramesHelper

        attr_reader :name, :title, :hidden

        # renders_one :confirmation, lambda { |**args|
        #     Modal::ConfirmationComponent.new(name: @name, **args)
        # }

        renders_one :small, lambda { |**args| Modal::SmallModalComponent.new(title: title, **args) }
        renders_one :big, lambda { |**args| Modal::BigModalComponent.new(title: title, **args) }
        renders_one :full, lambda { |**args| Modal::FullModalComponent.new(title: title, **args) }

        def initialize(title:,  hidden: true)
            super
            @name = name,
            @hidden = hidden,
            @title = title
        end
    end
end