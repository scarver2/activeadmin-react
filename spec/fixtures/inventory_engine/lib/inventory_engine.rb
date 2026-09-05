# spec/fixtures/inventory_engine/lib/inventory_engine.rb
# frozen_string_literal: true

require 'rails/engine'

require_relative 'inventory_engine/active_admin_react'

module InventoryEngine
  class Engine < Rails::Engine
    config.root = File.expand_path('..', __dir__)
  end
end
