class Recipe < ApplicationRecord
    
    # TODO: check whether plans and meal_pans will be deleted if associated recipes iiis destroyed
    has_many :meal_plans, dependent: :nullify
    has_many :ingredients, dependent: :destroy
    has_many :plans, through: :meal_plans, dependent: :destroy
    has_many :reviews,   -> { order(created_at: :desc) }, dependent: :destroy
    has_many :favorites, dependent: :destroy

    has_one_attached :image 
    
    

    validates :title, presence: true
    validate :acceptable_image


    def acceptable_image
        return unless image.attached?

        unless image.blob.byte_size <= 3.megabyte
            errors.add(:image, "is too big")
        end

        acceptable_types = ["image/jpeg", "image/png"]
        unless acceptable_types.include?(image.content_type)
            errors.add(:image, "must be a JPEG or PNG")
        end
    end

   
   
end
