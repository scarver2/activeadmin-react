# spec/fixtures/inventory_engine/lib/inventory_engine/active_admin_react.rb
# frozen_string_literal: true

module InventoryEngine
  module ActiveAdminReact
    module_function

    def install!
      registry = ActiveAdmin::React::Contributions.registry
      existing = registry.fetch('EngineStatus') if registry.registered?('EngineStatus')
      return existing if existing == contribution

      registry.register('EngineStatus', **attributes)
    end

    def contribution
      ActiveAdmin::React::Registry.new.register('EngineStatus', **attributes)
    end

    def attributes
      {
        namespace: 'dummy.inventory',
        source: 'inventory_engine/active_admin_react',
        owner: 'InventoryEngine::Engine',
        surfaces: %i[component panel],
        display: 'Engine contribution'
      }
    end
    private_class_method :attributes, :contribution
  end
end
