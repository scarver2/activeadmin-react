# spec/dummy/config.ru
# frozen_string_literal: true

require_relative 'config/environment'

use Rack::Static, urls: ['/dummy-assets'], root: File.expand_path('../../tmp', __dir__)
run Rails.application
