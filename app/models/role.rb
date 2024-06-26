class Role < ApplicationRecord
  has_and_belongs_to_many :admins, :join_table => :admins_roles
  
  belongs_to :resource,
             :polymorphic => true,
             :optional => true
  

  validates :resource_type,
            :inclusion => { :in => Rolify.resource_types },
            :allow_nil => true

  scopify


  def to_s
    name
  end
end
