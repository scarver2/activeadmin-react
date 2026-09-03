# spec/active_admin/react/registry_spec.rb
# frozen_string_literal: true

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React::Registry do
  subject(:registry) { described_class.new }

  describe '#register' do
    it 'normalizes identity and freezes metadata' do
      entry = registry.register(:orders, source: 'orders.js', owner: :commerce, kind: 'table')

      expect(entry).to have_attributes(name: 'orders', source: 'orders.js', owner: 'commerce')
      expect(entry.metadata).to eq(kind: 'table')
      expect(entry.metadata).to be_frozen
    end

    it 'rejects duplicate names after normalization' do
      registry.register(:orders, source: 'orders.js', owner: :commerce)

      expect do
        registry.register('orders', source: 'other.js', owner: 'projects')
      end.to raise_error(ActiveAdmin::React::Error, 'component already registered: orders')
    end
  end

  it 'fetches entries by string or symbol' do
    entry = registry.register(:orders, source: 'orders.js', owner: 'commerce')

    expect(registry.fetch('orders')).to be(entry)
    expect(registry.fetch(:orders)).to be(entry)
    expect { registry.fetch(:missing) }.to raise_error(KeyError)
  end

  it 'enumerates and returns registered entries' do
    first = registry.register(:orders, source: 'orders.js', owner: 'commerce')
    second = registry.register(:quotes, source: 'quotes.js', owner: 'projects')

    expect(registry.each.to_a).to eq([first, second])
    expect(registry.to_a).to eq([first, second])
  end
end
