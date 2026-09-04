# lib/active_admin/react/contributions.rb
# frozen_string_literal: true

module ActiveAdmin
  module React
    # Coordinates engine-owned React component contributions.
    module Contributions
      module_function

      def registry
        @registry ||= Registry.new
      end

      def register(name, **attributes)
        registry.register(name, **attributes)
      end

      def diagnostics
        registry.diagnostics
      end

      def reset!
        @registry = Registry.new
      end
    end
  end
end
