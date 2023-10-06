class TestMailer < ActionMailer::Base
  default from: 'info@aquosua.live'

  def welcome_email
    @user = params[:user]
    
    @url  = 'http://example.com/login'
    mail(to: '"aa@EXAMPLE.COM"', subject: 'Welcome to My Awesome Site')
  end
end