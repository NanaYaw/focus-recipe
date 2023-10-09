module ApplicationHelper
    include Pagy::Frontend

    
    def comment
    end

    def image_render(image, w = "100%", h = "100%", options = {})
        if image.representable?
            image.representation(resize_to_fill: [w, h]).processed.url
        else
             'sample.png'
        end 
    end
    

end


