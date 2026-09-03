# spec/rails_helper.rb
# frozen_string_literal: true

# Coverage must start before the Rails environment loads application code.
require 'spec_helper'

ENV['RAILS_ENV'] ||= 'test'

require 'rails/all'
