# spec/dummy/config/initializers/demo_engine.rb
# frozen_string_literal: true

Rails.application.config.to_prepare do
  InventoryEngine::ActiveAdminReact.install!
end
