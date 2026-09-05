# spec/active_admin/react/gemspec_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/DescribeClass, RSpec/ExampleLength

require 'spec_helper'

RSpec.describe 'activeadmin-react.gemspec' do
  subject(:gemspec) { Gem::Specification.load(File.expand_path('../../../activeadmin-react.gemspec', __dir__)) }

  let(:root) { File.expand_path('../../..', __dir__) }
  let(:public_globs) do
    %w[
      app/javascript/**/*
      docs/**/*
      lib/**/*
      sig/**/*
      CHANGELOG.md
      LICENSE.txt
      README.md
      RELEASES.md
    ]
  end

  it 'packages exactly every public implementation, contract, and documentation file' do
    public_files = Dir.glob(public_globs, base: root).select do |file|
      File.file?(File.join(root, file))
    end.sort

    expect(gemspec.files).to eq(public_files)
  end

  it 'declares supported Ruby, Rails, and ActiveAdmin bounds' do
    dependencies = gemspec.runtime_dependencies.to_h { |dependency| [dependency.name, dependency.requirement.to_s] }

    expect(gemspec.required_ruby_version.to_s).to eq('>= 3.2')
    expect(dependencies).to eq('activeadmin' => '>= 4.0.0.beta22, < 5', 'rails' => '>= 8.0, < 9')
  end

  it 'publishes immutable release metadata' do
    expect(gemspec.metadata).to include(
      'bug_tracker_uri' => 'https://github.com/scarver2/activeadmin-react/issues',
      'changelog_uri' => 'https://github.com/scarver2/activeadmin-react/blob/v0.1.0.alpha1/CHANGELOG.md',
      'documentation_uri' => 'https://github.com/scarver2/activeadmin-react/blob/v0.1.0.alpha1/README.md',
      'homepage_uri' => 'https://github.com/scarver2/activeadmin-react',
      'rubygems_mfa_required' => 'true',
      'source_code_uri' => 'https://github.com/scarver2/activeadmin-react/tree/v0.1.0.alpha1'
    )
  end
end

# rubocop:enable RSpec/DescribeClass, RSpec/ExampleLength
