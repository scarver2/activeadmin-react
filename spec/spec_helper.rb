# spec/spec_helper.rb
# frozen_string_literal: true

require 'simplecov'

SimpleCov.start 'rails'

RSpec.configure do |config|
  config.disable_monkey_patching!
  config.order = :random

  Kernel.srand config.seed
end
