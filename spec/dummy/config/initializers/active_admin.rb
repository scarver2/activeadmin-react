# spec/dummy/config/initializers/active_admin.rb
# frozen_string_literal: true

ActiveAdmin.setup do |config|
  config.site_title = 'ActiveAdmin React for Dummies'
  config.authentication_method = false
  config.current_user_method = false
end
