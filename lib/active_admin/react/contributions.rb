# frozen_string_literal: true

module ActiveAdmin
  module React
    module Contributions
      module_function

      def registry
        @registry ||= Registry.new
      end

      def register(name, source:, owner:, **metadata)
        registry.register(name, source: source, owner: owner, **metadata)
      end

      def reset!
        @registry = Registry.new
      end
    end
  end
end
