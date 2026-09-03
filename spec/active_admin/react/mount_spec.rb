# spec/active_admin/react/mount_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require 'active_admin/react/mount'

RSpec.describe ActiveAdmin::React::Mount do
  describe '#attributes' do
    let(:mount_attributes) do
      {
        class: 'orders',
        data: {
          'react-component' => 'OrdersTable',
          'react-props' => '{"page":2}'
        }
      }
    end

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
  end

  it 'exposes the fallback' do
    fallback = -> { 'Loading orders' }

    expect(described_class.new('OrdersTable', fallback: fallback).fallback).to be(fallback)
  end
end
