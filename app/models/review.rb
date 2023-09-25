class Review < ApplicationRecord
  belongs_to :recipe
  belongs_to :user

  belongs_to  :parent, class_name: 'Review', optional: true
  has_many    :replies, class_name: 'Review', foreign_key: :parent_id, dependent: :destroy

  validates :comment, length:{minimum: 4}

  STARS = [1,2,3,4,5,nil]
  validates :stars, inclusion: {in: STARS, message: "Must be between 1 and 5 stars"}
  
  scope :average_stars, -> { average(:stars) || 0.0 }

  # def stars_as_percent
  #   (stars / 5.0) * 100.0
  # end

  
end
