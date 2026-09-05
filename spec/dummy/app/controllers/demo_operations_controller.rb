# spec/dummy/app/controllers/demo_operations_controller.rb
# frozen_string_literal: true

class DemoOperationsController < ApplicationController
  rescue_from ActionController::RoutingError do
    render json: { error: 'not_found' }, status: :not_found
  end

  def create
    operation = repository.create(**identity)
    render json: operation.snapshot, status: :created
  end

  def show
    render json: { snapshot: operation.snapshot, events: operation.events_after(0) }
  end

  def update
    state = params.require(:state)
    progress = Integer(params[:progress], exception: false)
    return head :unprocessable_entity unless valid_event?(state, progress)

    DemoOperationJob.perform_later(operation.id, *identity.values, state, progress)
    head :accepted
  end

  def rebroadcast
    event = selected_event
    return head :unprocessable_entity unless event

    event[:idempotency_key] = "#{event[:idempotency_key]}:stale-fault" if params[:unique_key]
    ActionCable.server.broadcast(operation.broadcast_key, event)
    head :accepted
  end

  def cancel
    return head :unprocessable_entity unless params[:operation_id] == params[:id]

    current = operation
    DemoOperationJob.perform_later(current.id, *identity.values, 'cancelled', current.snapshot[:progress])
    render json: current.snapshot, status: :accepted
  end

  # Reveals only a deliberately seeded fixture ID so clients can test denial.
  def foreign
    render json: { operation_id: Rails.application.config.demo_foreign_operation.id }
  end

  private

  def selected_event
    return operation.snapshot unless params[:sequence]

    sequence = Integer(params[:sequence], exception: false)
    operation.events_after(0).find { |candidate| candidate[:sequence] == sequence }
  end

  def valid_event?(state, progress)
    %w[queued running retrying completed failed cancelled].include?(state) && progress&.between?(0, 100)
  end

  def repository
    request.env.fetch('activeadmin_react.operation_repository')
  end

  def identity
    { tenant_id: request.env.fetch('activeadmin_react.current_tenant_id'),
      user_id: request.env.fetch('activeadmin_react.current_user_id') }
  end

  def operation
    @operation ||= repository.find_authorized(operation_id: params[:id], **identity) ||
                   raise(ActionController::RoutingError, 'Unknown demo operation')
  end
end
