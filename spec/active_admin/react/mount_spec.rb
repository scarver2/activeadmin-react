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
  end

  it 'exposes the fallback' do
    fallback = -> { 'Loading orders' }

    expect(described_class.new('OrdersTable', fallback: fallback).fallback).to be(fallback)
  end
end
