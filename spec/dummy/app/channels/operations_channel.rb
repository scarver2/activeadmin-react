# spec/dummy/app/channels/operations_channel.rb
# frozen_string_literal: true

class OperationsChannel < ApplicationCable::Channel
  def resume(data)
    return unless operation

    after_sequence = Integer(data['after_sequence'], exception: false)
    return if after_sequence.nil? || after_sequence.negative?

    operation.events_after(after_sequence).each { |event| transmit(event) }
  end

  private

  attr_reader :operation

  def subscribed
    @operation = connection.operation_repository.find_authorized(
      operation_id: params[:operation_id],
      tenant_id: current_tenant_id,
      user_id: current_user_id
    )
    return reject unless operation

    stream_from(operation.broadcast_key)
    send_initial_snapshot
  end

  def send_initial_snapshot
    # The live demo requests replay in connected(), avoiding a newer snapshot
    # advancing its cursor before missed events have been delivered.
    transmit(operation.snapshot) unless params[:resume_only]
  end
end
