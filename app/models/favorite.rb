class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :recipe

  validates :user_id, presence: true
  validates :recipe_id, presence: true, uniqueness: {scope: [:user, :recipe]}


  scope :by_user, lambda { |user|
    where(:user_id => user.id)
  }


end
