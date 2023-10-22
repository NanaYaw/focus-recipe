class DeviseMailer < Devise::Mailer
  
    layout 'mailer'
    default from: 'no-reply@aquosua.live'


    private 

  
end
