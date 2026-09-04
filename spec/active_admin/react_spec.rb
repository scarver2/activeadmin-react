# spec/active_admin/react_spec.rb
# frozen_string_literal: true

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React do
  it 'defines the gem error type' do
    expect(described_class::Error).to be < StandardError
  end

  it 'exposes a prerelease version' do
    expect(Gem::Version.new(ActiveAdmin::React::VERSION)).to be_prerelease
  end
end
