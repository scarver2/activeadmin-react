# .simplecov
# frozen_string_literal: true

SimpleCov.configure do
  # Bundler loads the version through the gemspec before coverage can start.
  add_filter '/lib/active_admin/react/version.rb'
  add_filter '/spec/'

  enable_coverage :branch
  minimum_coverage 100
end
