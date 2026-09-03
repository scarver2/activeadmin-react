# spec/dummy/config/application.rb
# frozen_string_literal: true

require_relative 'boot'
require 'rails/all'
require 'active_admin/react'

module ActiveAdminReactDummy
  class Application < Rails::Application
    config.root = File.expand_path('..', __dir__)
    config.load_defaults 8.1
    config.eager_load = false
    config.secret_key_base = 'active-admin-react-dummy-secret-key-base'
    config.active_support.deprecation = :silence
    config.action_dispatch.show_exceptions = :none
    config.autoload_paths << root.join('lib')
  end
end
