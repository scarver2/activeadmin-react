# lib/active_admin/react/cable.rb
# frozen_string_literal: true

require 'action_cable'
require 'active_support/notifications'

module ActiveAdmin
  module React
    # Delivers non-authoritative Action Cable projections without changing durable application truth.
    module Cable
      FAILURE_EVENT = 'broadcast_failure.active_admin_react'

      # Immutable outcome of one best-effort broadcast attempt.
      class BroadcastResult
        attr_reader :error

        def initialize(error:)
          @error = error
          freeze
        end

        def success?
          error.nil?
        end
      end

      module_function

      def broadcast(stream:, payload:, context: {})
        ActionCable.server.broadcast(stream, payload)
        BroadcastResult.new(error: nil)
      rescue StandardError => e
        report_failure(stream:, context:, error: e)
        BroadcastResult.new(error: e)
      end

      def report_failure(stream:, context:, error:)
        safely do
          Rails.logger.error(
            "ActiveAdmin React Cable broadcast failed: stream=#{stream.inspect} " \
            "context=#{context.inspect} error=#{error.class}: #{error.message}"
          )
        end
        safely do
          ActiveSupport::Notifications.instrument(FAILURE_EVENT, stream:, context:, error:)
        end
      end
      private_class_method :report_failure

      def safely
        yield
      rescue StandardError
        nil
      end
      private_class_method :safely
    end
  end
end
