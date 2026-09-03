# spec/active_admin/react/mount_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require 'active_admin/react/mount'
require_relative '../../fixtures/react_mount_attributes'

RSpec.describe ActiveAdmin::React::Mount do
  include ReactMountAttributes

  describe '#attributes' do
    let(:mount_attributes) { react_mount_attributes(page: 2, class: 'orders') }

    let(:mount_with_html) do
      described_class.new('OrdersTable', props: { 'page' => 2 }, html: { class: 'orders' })
    end

    let(:mount_with_existing_data) do
      described_class.new(
        :orders_table,
        props: { filter: 'open' },
        html: { data: { controller: 'orders' } }
      )
    end

    it 'adds the component and serialized props to HTML attributes' do
      expect(mount_with_html.attributes).to eq(mount_attributes)
    end

    it 'preserves existing data attributes' do
      expect(mount_with_existing_data.attributes[:data]).to include(
        controller: 'orders',
        'react-component' => 'orders_table',
        'react-props' => '{"filter":"open"}'
      )
    end

    # rubocop:disable-next RSpec/ExampleLength
    it 'protects reserved data attributes from caller collisions' do
      mount = described_class.new(
        'OrdersTable',
        props: { page: 1 },
        html: { data: { 'react-component' => 'Wrong', 'react-props' => 'unsafe', controller: 'orders' } }
      )

      expect(mount.attributes[:data]).to eq(
        'react-component' => 'OrdersTable',
        'react-props' => '{"page":1}',
        controller: 'orders'
      )
    end

    # rubocop:disable-next RSpec/ExampleLength
    it 'normalizes supported props into deterministic JSON' do
      props = {
        symbol_key: :ready,
        boolean: true,
        decimal: 1.25,
        date: Date.new(2026, 9, 3),
        time: Time.utc(2026, 9, 3, 12, 30),
        nested: [{ 'safe' => '<not executable>' }, nil]
      }

      attributes = described_class.new('OrdersTable', props: props).attributes

      expect(attributes[:data]['react-props']).to include(
        '"symbol_key":"ready"',
        '"date":"2026-09-03"',
        '"safe":"<not executable>"'
      )
    end
  end

  it 'exposes the fallback' do
    fallback = -> { 'Loading orders' }

    expect(described_class.new('OrdersTable', fallback: fallback).fallback).to be(fallback)
  end

  # rubocop:disable-next RSpec/ExampleLength, RSpec/MultipleExpectations
  it 'rejects invalid components, props, and data attributes' do
    expect { described_class.new('') }.to raise_error(ArgumentError)
    expect { described_class.new('Orders Table') }.to raise_error(ArgumentError)
    expect { described_class.new('OrdersTable', props: Object.new) }.to raise_error(ArgumentError)
    expect { described_class.new('OrdersTable', props: { 1 => 'invalid' }) }.to raise_error(ArgumentError)
    expect { described_class.new('OrdersTable', props: { value: Float::NAN }) }.to raise_error(ArgumentError)
    expect { described_class.new('OrdersTable', html: { data: [] }).attributes }.to raise_error(ArgumentError)
  end
end
