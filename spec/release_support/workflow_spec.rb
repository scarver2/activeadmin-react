# spec/release_support/workflow_spec.rb
# frozen_string_literal: true

require 'spec_helper'

# A workflow is executable configuration rather than a Ruby class.
# rubocop:disable-next RSpec/DescribeClass
RSpec.describe 'release workflow' do
  subject(:workflow) { File.read(File.expand_path('../../.github/workflows/release.yml', __dir__)) }

  it 'runs only for the allowed release tag families' do
    expect(workflow).to include('- "v0.*.*"', '- "v1.0.0.rc*"')
    expect(workflow).not_to include('pull_request:', 'workflow_dispatch:')
  end

  it 'requires validation before the protected publish job' do
    expect(workflow).to include('needs: verify', 'environment: release')
    expect(workflow).to include('- run: bin/test', '- run: bin/package')
  end

  it 'keeps OIDC permission and publishing out of the validation job' do
    verify_job, publish_job = workflow.split(/^  publish:/, 2)

    expect(verify_job).not_to include('id-token: write', 'rubygems/release-gem')
    expect(publish_job).to include('id-token: write', 'rubygems/release-gem')
  end

  it 'contains no long-lived RubyGems credential path' do
    expect(workflow).not_to match(/RUBYGEMS_API_KEY|GEM_HOST_API_KEY|BUNDLE_GEM__PUSH_KEY/)
  end

  it 'pins every action to an immutable commit' do
    action_references = workflow.scan(/uses:\s+\S+@([^\s]+)/).flatten

    expect(action_references).not_to be_empty
    expect(action_references).to all(match(/\A[0-9a-f]{40}\z/))
  end
end
