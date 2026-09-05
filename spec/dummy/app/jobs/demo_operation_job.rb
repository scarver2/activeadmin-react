# spec/dummy/app/jobs/demo_operation_job.rb
# frozen_string_literal: true

# Work and event production belong to a job, never to the Cable subscription.
class DemoOperationJob < ActiveJob::Base
  self.queue_adapter = :async

  def perform(operation_id, tenant_id, user_id, state, progress)
    operation = Rails.application.config.demo_operations.find_authorized(
      operation_id: operation_id, tenant_id: tenant_id, user_id: user_id
    )
    return unless operation

    event = operation.append(state: state, progress: progress)
    ActionCable.server.broadcast(operation.broadcast_key, event)
  end
end
