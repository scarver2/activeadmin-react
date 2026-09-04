# activeadmin-react.gemspec
# frozen_string_literal: true

require_relative 'lib/active_admin/react/version'

Gem::Specification.new do |spec|
  spec.name = 'activeadmin-react'
  spec.version = ActiveAdmin::React::VERSION
  spec.authors = ['Stan Carver II']
  spec.summary = 'React islands for ActiveAdmin'
  spec.description = <<~DESCRIPTION
    An Arbre-native bridge for mounting optional React components inside ActiveAdmin while keeping ActiveAdmin Rails-first and server-rendered.
  DESCRIPTION
  spec.homepage = 'https://github.com/scarver2/activeadmin-react'
  spec.license = 'MIT'
  spec.required_ruby_version = '>= 3.2'

  spec.files = Dir[
    'app/javascript/**/*',
    'docs/**/*',
    'lib/**/*',
    'sig/**/*',
    'CHANGELOG.md',
    'LICENSE.txt',
    'README.md',
    'RELEASES.md'
  ].sort
  spec.require_paths = ['lib']

  spec.add_dependency 'activeadmin', '>= 4.0.0.beta22', '< 5'
  spec.add_dependency 'rails', '>= 8.0', '< 9'
  release_blob_uri = "#{spec.homepage}/blob/v#{spec.version}"
  spec.metadata['bug_tracker_uri'] = 'https://github.com/scarver2/activeadmin-react/issues'
  spec.metadata['changelog_uri'] = "#{release_blob_uri}/CHANGELOG.md"
  spec.metadata['documentation_uri'] = "#{release_blob_uri}/README.md"
  spec.metadata['homepage_uri'] = spec.homepage
  spec.metadata['rubygems_mfa_required'] = 'true'
  spec.metadata['source_code_uri'] = "#{spec.homepage}/tree/v#{spec.version}"
end
