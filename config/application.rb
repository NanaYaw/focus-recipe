require_relative "boot"

require "rails/all"
require "view_component"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FocusRecipeApp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    config.view_component.show_previews = true
    # config.serve_static_assets = true

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
    config.allow_insecure_token_lookup = true

    config.action_view.image_loading = "lazy"
    config.active_storage.service = :local

    # config.exceptions_app = ->(env) {
    #   ErrorsController.action(:show).call(env)
    # }
  end
end
