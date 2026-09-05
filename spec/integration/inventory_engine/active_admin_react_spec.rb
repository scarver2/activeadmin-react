# spec/integration/inventory_engine/active_admin_react_spec.rb
# frozen_string_literal: true

require_relative '../../rails_helper'
require_relative '../../dummy/config/environment'

RSpec.describe InventoryEngine::ActiveAdminReact do
  before { ActiveAdmin::React::Contributions.reset! }
  after { ActiveAdmin::React::Contributions.reset! }

  it 'loads the fixture as a real Rails engine' do
    expect(Rails.application.railties).to include(InventoryEngine::Engine.instance)
  end

  it 'reinstalls the same contribution across Rails prepare cycles without replacing it' do
    original = described_class.install!

    Rails.application.reloader.prepare!
    Rails.application.reloader.prepare!

    expect(ActiveAdmin::React::Contributions.registry.fetch('EngineStatus')).to equal(original)
    expect(ActiveAdmin::React::Contributions.diagnostics.size).to eq(1)
  end

  # The expectation must preserve the competing entry as well as explain the conflict.
  # rubocop:disable-next RSpec/ExampleLength
  it 'rejects competing ownership and retains the original contribution' do
    original = ActiveAdmin::React::Contributions.register(
      'EngineStatus', namespace: 'competitor', owner: 'OtherEngine', source: 'other/adapter'
    )

    expect { described_class.install! }.to raise_error(
      ActiveAdmin::React::Error, %r{OtherEngine.*competitor.*other/adapter.*InventoryEngine::Engine}
    )
    expect(ActiveAdmin::React::Contributions.registry.fetch('EngineStatus')).to equal(original)
  end

  it 'rejects changed provenance even when the owner name matches' do
    ActiveAdmin::React::Contributions.register(
      'EngineStatus', namespace: 'dummy.inventory', owner: 'InventoryEngine::Engine', source: 'wrong/adapter'
    )

    expect { described_class.install! }.to raise_error(ActiveAdmin::React::Error, %r{wrong/adapter})
  end
end
