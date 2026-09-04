# spec/dummy/config/initializers/demo_engine.rb
# frozen_string_literal: true

Rails.application.config.to_prepare do
  next if ActiveAdmin::React::Contributions.registry.registered?('engine-status')

  ActiveAdmin::React::Contributions.register(
    'engine-status',
    namespace: 'dummy.inventory',
    source: 'dummy-engine',
    owner: 'activeadmin-react-dummy',
    surfaces: %i[component panel],
    display: 'Engine contribution'
  )
end
