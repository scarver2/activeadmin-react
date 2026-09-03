# frozen_string_literal: true

require 'active_admin'
require_relative 'react/arbre'
require_relative 'react/contributions'
require_relative 'react/mount'
require_relative 'react/registry'
require_relative 'react/version'

module ActiveAdmin
  module React
    class Error < StandardError; end
  end
end

Arbre::Element.include(ActiveAdmin::React::Arbre)
