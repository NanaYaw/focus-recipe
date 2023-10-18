class Profile < ApplicationRecord
    belongs_to :user

    validates :first_name, presence: true
    validates :last_name,  presence: true
    validates :phone,      presence: true

    has_one_attached :user_profile_image 
    validate :acceptable_image


    def acceptable_image
        return unless user_profile_image.attached?

        unless user_profile_image.blob.byte_size <= 3.megabyte
            errors.add(:user_profile_image, "is too big")
        end

        acceptable_types = ["image/jpeg", "image/png"]
        unless acceptable_types.include?(user_profile_image.content_type)
            errors.add(:user_profile_image, "must be a JPEG or PNG")
        end
    end 
end
