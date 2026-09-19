# spec/active_admin/react/cable_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations

require 'rails_helper'

require 'active_admin/react'

RSpec.describe ActiveAdmin::React::Cable do
  let(:server) { instance_double(ActionCable::Server::Base) }
  let(:logger) { instance_double(ActiveSupport::Logger) }
  let(:stream) { 'operations:report-123' }
  let(:payload) { { type: 'progress', token: 'secret-payload-token' } }
  let(:context) { { event_id: 7, workflow: 'operation' } }

  before do
    allow(ActionCable).to receive(:server).and_return(server)
    allow(Rails).to receive(:logger).and_return(logger)
    allow(logger).to receive(:error)
  end

  it 'returns an immutable successful result without emitting failure diagnostics' do
    events = []
    allow(server).to receive(:broadcast).with(stream, payload)

    result = ActiveSupport::Notifications.subscribed(->(event) { events << event }, described_class::FAILURE_EVENT) do
      described_class.broadcast(stream:, payload:, context:)
    end

    expect(result).to be_success
    expect(result.error).to be_nil
    expect(result).to be_frozen
    expect(events).to be_empty
    expect(logger).not_to have_received(:error)
  end

  it 'returns the transport error and emits payload-free failure diagnostics without mutating caller values' do
    events = []
    error = IOError.new('adapter offline')
    original_payload = payload.dup
    original_context = context.dup
    allow(server).to receive(:broadcast).with(stream, payload).and_raise(error)

    result = ActiveSupport::Notifications.subscribed(->(event) { events << event }, described_class::FAILURE_EVENT) do
      described_class.broadcast(stream:, payload:, context:)
    end

    expect(result).not_to be_success
    expect(result.error).to be(error)
    expect(result).to be_frozen
    expect(events.one? { |event| event.payload == { stream:, context:, error: } }).to be(true)
    expect(events.first.payload).not_to have_key(:payload)
    expect(logger).to have_received(:error).with(include(stream, 'operation', 'IOError', 'adapter offline'))
    expect(logger).not_to have_received(:error).with(include('secret-payload-token'))
    expect(payload).to eq(original_payload)
    expect(context).to eq(original_context)
  end

  it 'contains logger and notification subscriber failures while preserving the broadcast error' do
    broadcast_error = IOError.new('adapter offline')
    allow(server).to receive(:broadcast).and_raise(broadcast_error)
    allow(logger).to receive(:error).and_raise('logger offline')

    result = ActiveSupport::Notifications.subscribed(
      ->(_event) { raise 'subscriber offline' },
      described_class::FAILURE_EVENT
    ) do
      described_class.broadcast(stream:, payload:, context:)
    end

    expect(result).not_to be_success
    expect(result.error).to be(broadcast_error)
    expect(result).to be_frozen
  end
end

# rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
