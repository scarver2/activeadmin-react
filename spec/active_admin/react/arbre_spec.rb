# spec/active_admin/react/arbre_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require 'active_admin/react/arbre'
require 'active_admin/react/mount'

RSpec.describe ActiveAdmin::React::Arbre do
  let(:host_class) do
    Class.new do
      include ActiveAdmin::React::Arbre

      attr_accessor :attributes, :nodes

      def initialize
        self.nodes = []
      end

      def div(**new_attributes, &block)
        self.attributes = new_attributes
        instance_eval(&block) if block
        self
      end

      def text_node(value)
        nodes << value
      end
    end
  end

  let(:host) { host_class.new }
  let(:mount_attributes) do
    {
      data: {
        'react-component' => 'OrdersTable',
        'react-props' => '{"page":1}'
      }
    }
  end

  it 'renders a callable fallback inside the mount' do
    result = host.react_component('OrdersTable', props: { page: 1 }, fallback: -> { 'Loading' })

    expect(result).to be(host)
    expect(host.attributes).to include(mount_attributes)
    expect(host.nodes).to eq(['Loading'])
  end

  it 'does not render a non-callable fallback' do
    host.react_component('OrdersTable', fallback: 'Loading')

    expect(host.nodes).to be_empty
  end
end
