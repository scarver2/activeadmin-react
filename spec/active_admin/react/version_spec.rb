# spec/active_admin/react/version_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require 'active_admin/react/version'

RSpec.describe ActiveAdmin::React::VERSION do
  # described_class is nil because VERSION is a String value, not a class.
  subject(:version) { ActiveAdmin::React::VERSION } # rubocop:disable RSpec/DescribedClass

  it 'uses a valid semantic version format' do
    expect(version).to match(
      /\A\d+\.\d+\.\d+(?:[.-][0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?(?:\+[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?\z/
    )
  end

  it 'is accepted by the RubyGems version parser' do
    expect(Gem::Version.new(version).to_s).to eq(version)
  end
end
