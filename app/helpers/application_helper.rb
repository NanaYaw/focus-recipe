module ApplicationHelper
    include Pagy::Frontend

    def render_flash_stream
        turbo_stream.update "flash", partial: "application/flash"
    end
    
    def comment
    end

    def image_render(image, w = "100%", h = "100%", options = {})
        if image.representable?
            image.variant(resize_to_fill: [w, h], format: :jpg, saver: { strip: true, quality: 50 }).processed.url
        else
            'sample.png'
        end 
    end

    def profile_image
        if current_user.profile.user_profile_image.attached?
            image_tag current_user.profile.user_profile_image, size: "40", class: "mask is-squircle bg-gray-200"
        else
            image_tag 'user-1.png', size: "40", class: "mask is-squircle bg-gray-200 p-1"
        end
    end
    
    def full_title(page_title = '')                    
        base_title = "Ama Boadiwaa App." 
        if page_title.blank?                             
            base_title                                     
        else
            page_title + " | " + base_title
        end                 
    end

end


