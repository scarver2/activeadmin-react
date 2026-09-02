# .simplecov
# frozen_string_literal: true

SimpleCov.configure do
  # Bundler loads the version through the gemspec before coverage can start.
  skip '/lib/active_admin/react/version.rb'
  skip '/spec/'

  enable_coverage :branch
  minimum_coverage 100
end
