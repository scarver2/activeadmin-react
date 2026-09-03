# spec/dummy/config/initializers/demo_engine.rb
# frozen_string_literal: true

Rails.application.config.to_prepare do
  next if ActiveAdmin::React::Contributions.registry.to_a.any? { |entry| entry.name == 'engine-status' }

  ActiveAdmin::React::Contributions.register(
    'engine-status',
    source: 'dummy-engine',
    owner: 'activeadmin-react-dummy',
    display: 'Engine contribution'
  )
end
