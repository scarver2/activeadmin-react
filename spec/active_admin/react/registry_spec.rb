# spec/active_admin/react/registry_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React::Registry do
  subject(:registry) { described_class.new }

  def register(name, **overrides)
    registry.register(
      name,
      namespace: 'commerce.admin',
      source: 'commerce_engine/active_admin_react',
      owner: 'CommerceEngine',
      **overrides
    )
  end

  describe '#register' do
    it 'normalizes identity and freezes the complete contract' do
      entry = register(:orders, surfaces: %i[page component component], kind: 'table')

      expect(entry).to have_attributes(
        name: 'orders',
        namespace: 'commerce.admin',
        source: 'commerce_engine/active_admin_react',
        owner: 'CommerceEngine',
        surfaces: %i[component page]
      )
      expect(entry).to be_frozen
      expect(entry.surfaces).to be_frozen
      expect(entry.metadata).to eq(kind: 'table')
      expect(entry.metadata).to be_frozen
    end

    it 'rejects duplicate ownership with actionable diagnostics' do
      register(:orders)

      expect do
        register('orders', namespace: 'projects.admin', source: 'projects/adapter', owner: 'ProjectsEngine')
      end.to raise_error(
        ActiveAdmin::React::Error,
        'component "orders" is owned by "CommerceEngine" in namespace "commerce.admin" from ' \
        '"commerce_engine/active_admin_react"; attempted owner "ProjectsEngine" in namespace ' \
        '"projects.admin" from "projects/adapter"'
      )
    end

    it 'requires explicit identity and at least one surface' do
      %i[name namespace source owner].each do |field|
        arguments = { namespace: 'commerce', source: 'adapter', owner: 'CommerceEngine' }
        name = field == :name ? ' ' : 'orders'
        arguments[field] = '' unless field == :name

        expect { registry.register(name, **arguments) }.to raise_error(
          ActiveAdmin::React::Error,
          "#{field} must be present"
        )
      end
      expect { register(:orders, surfaces: []) }.to raise_error(ActiveAdmin::React::Error, 'surfaces must not be empty')
      expect { register(:orders, surfaces: ['']) }.to raise_error(ActiveAdmin::React::Error, 'surface must be present')
    end
  end

  it 'fetches entries by string or symbol and reports registration' do
    entry = register(:orders)

    expect(registry.fetch('orders')).to be(entry)
    expect(registry.fetch(:orders)).to be(entry)
    expect(registry.registered?(:orders)).to be(true)
    expect(registry.registered?(' missing ')).to be(false)
    expect { registry.fetch(:missing) }.to raise_error(KeyError)
  end

  it 'enumerates deterministically independent of registration order' do
    reporting = register(:report, namespace: 'z.reporting', owner: 'ReportingEngine')
    inventory = register(:inventory, namespace: 'a.inventory', owner: 'InventoryEngine')
    orders = register(:orders, namespace: 'a.inventory', owner: 'InventoryEngine')

    expect(registry.each.to_a).to eq([inventory, orders, reporting])
    expect(registry.to_a).to eq([inventory, orders, reporting])
    expect(registry.to_a).to be_frozen
  end

  it 'provides immutable host diagnostics' do
    register(:orders, surfaces: %i[panel component], description: 'Orders')

    expect(registry.diagnostics).to eq(
      [
        {
          name: 'orders',
          namespace: 'commerce.admin',
          owner: 'CommerceEngine',
          source: 'commerce_engine/active_admin_react',
          surfaces: %i[component panel],
          metadata: { description: 'Orders' }
        }
      ]
    )
    expect(registry.diagnostics).to be_frozen
    expect(registry.diagnostics.first).to be_frozen
  end
end

# rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
