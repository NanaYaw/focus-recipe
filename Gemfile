source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.3.3"

gem "rails", "~> 7.0.6"
gem "sprockets-rails"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"
gem "jsbundling-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "cssbundling-rails"
gem "jbuilder"
gem "redis", "~> 4.0"
# gem "kredis"
# gem "bcrypt", "~> 3.1.7"
gem "tzinfo-data", platforms: %i[mingw mswin x64_mingw jruby]
gem "bootsnap", require: false
# gem "sassc-rails"
# gem "image_processing", "~> 1.2"

gem "devise", "~> 4.9"
gem "view_component", "~> 3.0"
gem "pagy", "~> 6.0"
gem "ransack", "~> 4.0"
gem "i18n-tasks", "~> 1.0"
gem "inline_svg", "~> 1.9"

gem "faker", "~> 3.2"
gem "aws-sdk-s3", "~> 1.132"
gem "image_processing", "~> 1.12"
gem "wicked_pdf", "~> 2.7"
gem "wkhtmltopdf-binary", "~> 0.12.6.6"
gem "htmlbeautifier", "~> 1.4"
gem "devise_invitable", "~> 2.0"
gem "pundit", "~> 2.3"
gem "rolify"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[mri mingw x64_mingw]
  gem 'pry-rails'

  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers", "~> 5.3.0"
end

group :development do
  gem "awesome_print", "~> 1.9"

  gem "web-console"
  # gem "rack-mini-profiler"
  # gem "spring"
  gem "mailcatcher", "~> 0.2.4"
end



gem "capistrano", "~> 3.11"
gem "capistrano-rails", "~> 1.4"
gem "capistrano-passenger", "~> 0.2.0"
gem "capistrano-rbenv", "~> 2.1", ">= 2.1.4"
