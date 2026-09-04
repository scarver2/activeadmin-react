# spec/active_admin/react/contributions_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations

require 'open3'

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React::Contributions do
  before { described_class.reset! }

  it 'shares a registry and delegates the complete registration contract' do
    registry = described_class.registry
    entry = described_class.register(
      :orders,
      namespace: :commerce,
      source: 'orders.js',
      owner: :commerce,
      surfaces: %i[page component],
      kind: 'table'
    )

    expect(described_class.registry).to be(registry)
    expect(entry).to eq(registry.fetch(:orders))
    expect(entry).to have_attributes(namespace: 'commerce', surfaces: %i[component page])
    expect(entry.metadata).to eq(kind: 'table')
  end

  it 'exposes diagnostics and resets registry isolation' do
    described_class.register(:orders, namespace: :commerce, source: 'orders.js', owner: :commerce)
    original = described_class.registry

    expect(described_class.diagnostics.first).to include(name: 'orders', namespace: 'commerce')

    described_class.reset!

    expect(described_class.registry).not_to be(original)
    expect(described_class.registry.to_a).to be_empty
  end

  it 'accepts two Rails engine adapters without eager-loading engine models' do
    stub_const('InventoryEngine', Class.new(Rails::Engine))
    stub_const('ReportingEngine', Class.new(Rails::Engine))
    inventory_adapter = lambda do
      described_class.register(:inventory, namespace: :inventory, source: 'inventory/adapter', owner: InventoryEngine)
    end
    reporting_adapter = lambda do
      described_class.register(:reports, namespace: :reporting, source: 'reporting/adapter', owner: ReportingEngine)
    end

    reporting_adapter.call
    inventory_adapter.call

    expect(described_class.registry.to_a.map(&:name)).to eq(%w[inventory reports])
    expect(described_class.registry.to_a.map(&:owner)).to contain_exactly('InventoryEngine', 'ReportingEngine')
  end

  it 'loads the core gem without discovering arbitrary engine adapters' do
    script = <<~RUBY
      require 'rails/all'
      require 'active_admin/react'
      abort ActiveAdmin::React::Contributions.diagnostics.inspect unless ActiveAdmin::React::Contributions.diagnostics.empty?
    RUBY

    _output, error, status = Open3.capture3(Gem.ruby, '-Ilib', '-e', script, chdir: Dir.pwd)

    expect(status).to be_success, error
  end
end

# rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
