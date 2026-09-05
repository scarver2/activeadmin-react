# spec/dummy/app/controllers/demo_operations_controller.rb
# frozen_string_literal: true

class DemoOperationsController < ApplicationController
  rescue_from ActionController::RoutingError do
    head :not_found
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
    ActionCable.server.broadcast(operation.broadcast_key, operation.snapshot)
    head :accepted
  end

  private

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
