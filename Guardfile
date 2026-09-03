# frozen_string_literal: true

guard :rubocop, cli: ['-A'] do
  watch(/.+\.rb$/)
  watch('Rakefile') { 'Rakefile' }
  watch(%r{(?:.+/)?\.rubocop(?:_todo)?\.yml$}) { |match| File.dirname(match[0]) }
end

guard :rspec, cmd: 'mise exec -- bundle exec rspec' do
  watch(%r{^spec/(.+)_spec\.rb$})
  watch(%r{^spec/spec_helper\.rb$}) { 'spec' }
  watch(%r{^lib/(.+)\.rb$}) { |match| "spec/#{match[1]}_spec.rb" }
end

guard :bundler do
  require 'guard/bundler'
  require 'guard/bundler/verify'

  helper = Guard::Bundler::Verify.new
  files = ['Gemfile']
  files += Dir['*.gemspec'] if files.any? { |file| helper.uses_gemspec?(file) }

  files.each { |file| watch(helper.real_path(file)) }
end
