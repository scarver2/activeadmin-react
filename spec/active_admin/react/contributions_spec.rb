# spec/active_admin/react/contributions_spec.rb
# frozen_string_literal: true

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React::Contributions do
  before { described_class.reset! }

  it 'shares a registry and delegates registration' do
    registry = described_class.registry
    entry = described_class.register(:orders, source: 'orders.js', owner: :commerce, kind: 'table')

    expect(described_class.registry).to be(registry)
    expect(entry).to eq(registry.fetch(:orders))
    expect(entry.metadata).to eq(kind: 'table')
  end

  it 'resets the registry' do
    described_class.register(:orders, source: 'orders.js', owner: :commerce)

    described_class.reset!

    expect(described_class.registry.to_a).to be_empty
  end
end
