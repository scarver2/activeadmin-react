# spec/release_support/release_guard_spec.rb
# frozen_string_literal: true

require 'spec_helper'

require_relative '../../bin/support/release_guard'

# The internal support namespace intentionally lives outside the packaged gem hierarchy.
# rubocop:disable-next RSpec/SpecFilePathFormat
RSpec.describe ActiveAdminReact::ReleaseSupport::Guard do
  let(:release_error) { ActiveAdminReact::ReleaseSupport::Error }
  let(:repository_class) do
    Struct.new(:branch, :clean, :head, :remote_master, :tag_commit_value, :remote_tag, keyword_init: true) do
      def clean? = clean
      def remote_tag_exists?(_tag) = remote_tag
      def tag_commit(_tag) = tag_commit_value
    end
  end

  let(:repository) do
    repository_class.new(
      branch: 'master',
      clean: true,
      head: 'a' * 40,
      remote_master: 'a' * 40,
      tag_commit_value: 'a' * 40,
      remote_tag: false
    )
  end
  let(:environment) do
    {
      'GITHUB_EVENT_NAME' => 'push',
      'GITHUB_REF_NAME' => 'v0.1.0',
      'GITHUB_REF_TYPE' => 'tag'
    }
  end
  let(:guard) { described_class.new(version: '0.1.0', repository: repository, environment: environment) }

  describe 'tag policy' do
    it 'accepts ordinary pre-1.0 and future 1.0 release-candidate tags' do
      %w[v0.0.0 v0.1.0 v0.12.34 v1.0.0.rc1 v1.0.0.rc10].each do |tag|
        expect(described_class::TAG_PATTERN).to match(tag)
      end
    end

    # rubocop:disable-next RSpec/ExampleLength
    it 'rejects suffixes, leading zeroes, invalid candidates, stable 1.0, and later majors' do
      invalid_tags = %w[
        0.1.0
        V0.1.0
        v0.01.0
        v0.1
        v0.1.0.alpha1
        v0.1.0.beta1
        v0.1.0+build.1
        v0.1.0.rc1
        v1.0.0
        v1.0.0.rc0
        v1.0.0.rc01
        v1.0.1.rc1
        v2.0.0
      ]

      invalid_tags.each { |tag| expect(described_class::TAG_PATTERN).not_to match(tag) }
    end
  end

  describe '#verify_ci!' do
    it 'accepts the matching tag at clean current origin/master' do
      expect(guard.verify_ci!).to eq('v0.1.0')
    end

    it 'accepts a matching future release candidate' do
      environment['GITHUB_REF_NAME'] = 'v1.0.0.rc2'
      candidate = described_class.new(version: '1.0.0.rc2', repository: repository, environment: environment)

      expect(candidate.verify_ci!).to eq('v1.0.0.rc2')
    end

    it 'rejects an event other than push' do
      environment['GITHUB_EVENT_NAME'] = 'pull_request'

      expect { guard.verify_ci! }.to raise_error(release_error, /push event/)
    end

    it 'rejects a branch ref' do
      environment['GITHUB_REF_TYPE'] = 'branch'

      expect { guard.verify_ci! }.to raise_error(release_error, /tag ref/)
    end

    it 'rejects a malformed tag' do
      environment['GITHUB_REF_NAME'] = 'v0.1.0.beta1'

      expect { guard.verify_ci! }.to raise_error(release_error, /v0\.MINOR\.PATCH/)
    end

    it 'rejects a tag that differs from the gem version' do
      environment['GITHUB_REF_NAME'] = 'v0.2.0'

      expect { guard.verify_ci! }.to raise_error(release_error, /v0\.1\.0/)
    end

    it 'rejects a dirty checkout' do
      repository.clean = false

      expect { guard.verify_ci! }.to raise_error(release_error, /clean working tree/)
    end

    it 'rejects a tag that does not point to HEAD' do
      repository.tag_commit_value = 'b' * 40

      expect { guard.verify_ci! }.to raise_error(release_error, /checked-out HEAD/)
    end

    it 'rejects a release commit that is not current origin master' do
      repository.remote_master = 'b' * 40

      expect { guard.verify_ci! }.to raise_error(release_error, %r{current origin/master})
    end
  end

  describe '#verify_local!' do
    before { repository.tag_commit_value = nil }

    it 'accepts clean master at origin when the tag is unused' do
      expect(guard.verify_local!).to eq('v0.1.0')
    end

    it 'rejects a version outside the release allowlist' do
      invalid = described_class.new(version: '0.1.0.beta1', repository: repository)

      expect { invalid.verify_local! }.to raise_error(release_error, /v0\.MINOR\.PATCH/)
    end

    it 'rejects a dirty worktree' do
      repository.clean = false

      expect { guard.verify_local! }.to raise_error(release_error, /clean working tree/)
    end

    it 'rejects a branch other than master' do
      repository.branch = 'release'

      expect { guard.verify_local! }.to raise_error(release_error, /from master/)
    end

    it 'rejects master that differs from origin' do
      repository.remote_master = 'b' * 40

      expect { guard.verify_local! }.to raise_error(release_error, %r{current origin/master})
    end

    it 'rejects an existing local tag' do
      repository.tag_commit_value = repository.head

      expect { guard.verify_local! }.to raise_error(release_error, /exists locally/)
    end

    it 'rejects an existing remote tag' do
      repository.tag_commit_value = nil
      repository.remote_tag = true

      expect { guard.verify_local! }.to raise_error(release_error, /exists on origin/)
    end
  end
end
