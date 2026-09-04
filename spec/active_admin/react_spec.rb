# spec/active_admin/react_spec.rb
# frozen_string_literal: true

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React do
  it 'defines the gem error type' do
    expect(described_class::Error).to be < StandardError
  end

  it 'exposes the current pre-1.0 version' do
    expect(ActiveAdmin::React::VERSION).to eq('0.1.0')
  end
end
