# spec/active_admin/react/version_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require 'active_admin/react/version'

RSpec.describe ActiveAdmin::React do
  it 'uses a valid semantic prerelease version' do
    version = described_class::VERSION

    expect(version).to match(
      /\A\d+\.\d+\.\d+(?:[.-][0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?(?:\+[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?\z/
    )
    expect(Gem::Version.new(version).to_s).to eq(version)
  end
end
