class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  has_many :reviews
  has_many :recipes
  has_many :recipes, through: :reviews, dependent: :destroy

  has_one :profile
  accepts_nested_attributes_for :profile

  def profile
    super || build_profile
  end

  def name
    
  end
end
