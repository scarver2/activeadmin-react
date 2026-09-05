# frozen_string_literal: true

require 'bundler/gem_tasks'
require 'rspec/core/rake_task'
require 'rubocop/rake_task'

RSpec::Core::RakeTask.new(:spec)
RuboCop::RakeTask.new(:rubocop)

desc 'Run JavaScript tests and coverage'
task :js do
  sh 'npm run test:js'
end

desc 'Validate public RBS signatures'
task :rbs do
  sh 'bundle exec rbs validate'
end

task default: %i[spec rubocop rbs js]
