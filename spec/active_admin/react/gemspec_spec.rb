# spec/active_admin/react/gemspec_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/DescribeClass, RSpec/ExampleLength

require 'spec_helper'

RSpec.describe 'activeadmin-react.gemspec' do
  subject(:gemspec) { Gem::Specification.load(File.expand_path('../../../activeadmin-react.gemspec', __dir__)) }

  it 'packages every public implementation and contract surface' do
    expect(gemspec.files).to include(
      'app/javascript/active_admin/react/index.js',
      'app/javascript/active_admin/react/protocol.js',
      'lib/active_admin/react.rb',
      'sig/active_admin/react.rbs',
      'CHANGELOG.md',
      'LICENSE.txt',
      'README.md',
      'RELEASES.md'
    )
  end

  it 'excludes development and test artifacts' do
    forbidden_prefixes = %w[coverage/ node_modules/ spec/ test/ tmp/]

    expect(gemspec.files).not_to include(a_string_matching(/\A(?:#{forbidden_prefixes.join('|')})/))
  end

  it 'declares supported Ruby, Rails, and ActiveAdmin bounds' do
    dependencies = gemspec.runtime_dependencies.to_h { |dependency| [dependency.name, dependency.requirement.to_s] }

    expect(gemspec.required_ruby_version.to_s).to eq('>= 3.2')
    expect(dependencies).to eq('activeadmin' => '>= 4.0.0.beta22, < 5', 'rails' => '>= 8.0, < 9')
  end

  it 'publishes immutable release metadata' do
    expect(gemspec.metadata).to include(
      'bug_tracker_uri' => 'https://github.com/scarver2/activeadmin-react/issues',
      'changelog_uri' => 'https://github.com/scarver2/activeadmin-react/blob/v0.1.0.beta1/CHANGELOG.md',
      'documentation_uri' => 'https://github.com/scarver2/activeadmin-react/blob/v0.1.0.beta1/README.md',
      'homepage_uri' => 'https://github.com/scarver2/activeadmin-react',
      'rubygems_mfa_required' => 'true',
      'source_code_uri' => 'https://github.com/scarver2/activeadmin-react/tree/v0.1.0.beta1'
    )
  end
end

# rubocop:enable RSpec/DescribeClass, RSpec/ExampleLength
