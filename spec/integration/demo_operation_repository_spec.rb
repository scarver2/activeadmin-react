# spec/integration/demo_operation_repository_spec.rb
# frozen_string_literal: true

require_relative '../rails_helper'
require_relative '../dummy/config/environment'

RSpec.describe DemoOperationRepository do
  subject(:repository) { described_class.new }

  let(:identity) { { tenant_id: 'tenant', user_id: 'user' } }
  let(:operation) { repository.create(**identity) }

  it 'isolates operations by both user and tenant' do
    expect(repository.find_authorized(operation_id: operation.id, **identity)).to eq(operation)
    expect(repository.find_authorized(operation_id: operation.id, **identity.merge(user_id: 'other'))).to be_nil
    expect(repository.find_authorized(operation_id: operation.id, **identity.merge(tenant_id: 'other'))).to be_nil
  end

  it 'retains ordered replay events without exposing mutable storage' do
    operation.append(state: 'running', progress: 50)
    operation.append(state: 'completed', progress: 100)
    operation.snapshot[:state] = 'corrupted'

    expect(operation.snapshot[:state]).to eq('completed')
    expect(operation.events_after(1).map { |event| event[:sequence] }).to eq([2, 3])
  end

  it 'produces and broadcasts events from a job' do
    allow(Rails.application.config).to receive(:demo_operations).and_return(repository)
    allow(ActionCable.server).to receive(:broadcast)

    DemoOperationJob.perform_now(operation.id, 'tenant', 'user', 'running', 50)

    expect(operation.snapshot[:sequence]).to eq(2)
    expect(ActionCable.server).to have_received(:broadcast).with(operation.broadcast_key, operation.snapshot)
  end

  it 'does not produce events for an unauthorized operation' do
    allow(Rails.application.config).to receive(:demo_operations).and_return(repository)

    DemoOperationJob.perform_now(operation.id, 'tenant', 'other', 'running', 50)

    expect(operation.snapshot[:sequence]).to eq(1)
  end
end
