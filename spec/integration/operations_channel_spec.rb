# spec/integration/operations_channel_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations

require_relative '../rails_helper'
require_relative '../dummy/config/environment'
require 'action_cable/channel/test_case'

RSpec.describe OperationsChannel do
  before do
    stub_const('TestOperation', Data.define(:broadcast_key, :snapshot, :events) do
      def events_after(sequence)
        events.select { |event| event[:sequence] > sequence }
      end
    end)
    stub_const('TestOperationsChannel', Class.new(described_class) do
      include ActionCable::Channel::ChannelStub
    end)
    stub_const('TestOperationRepository', Class.new do
      def find_authorized(operation_id:, tenant_id:, user_id:); end
    end)
  end

  let(:events) do
    [
      { operation_id: 'op-1', idempotency_key: 'op-1:1', sequence: 1, state: 'running' },
      { operation_id: 'op-1', idempotency_key: 'op-1:2', sequence: 2, state: 'completed' }
    ]
  end
  let(:operation) { TestOperation.new('operations:tenant-1:op-1', events.last, events) }
  let(:repository) { instance_double(TestOperationRepository) }
  let(:connection) do
    ActionCable::Channel::ConnectionStub.new(
      current_tenant_id: 'tenant-1',
      current_user_id: 'user-1',
      operation_repository: repository
    )
  end
  let(:channel) do
    TestOperationsChannel.new(connection, 'operations', operation_id: 'op-1', tenant_id: 'attacker-controlled')
  end

  it 'streams and snapshots only an operation authorized by server-owned identity' do
    allow(repository).to receive(:find_authorized).and_return(operation)

    channel.send(:subscribed)

    expect(repository).to have_received(:find_authorized).with(
      operation_id: 'op-1',
      tenant_id: 'tenant-1',
      user_id: 'user-1'
    )
    expect(channel.streams).to eq(['operations:tenant-1:op-1'])
    expect(connection.transmissions.last[:message]).to eq(events.last.stringify_keys)
    expect(channel.send(:subscription_rejected?)).to be_falsey
  end

  it 'rejects an operation unauthorized for the current user or tenant' do
    allow(repository).to receive(:find_authorized).and_return(nil)

    channel.send(:subscribed)

    expect(channel.send(:subscription_rejected?)).to be(true)
    expect(channel.streams).to be_empty
    expect(connection.transmissions).to be_empty
  end

  it 'replays only events after the client resume cursor' do
    allow(repository).to receive(:find_authorized).and_return(operation)
    channel.send(:subscribed)
    connection.transmissions.clear

    channel.resume('after_sequence' => 1)

    expect(connection.transmissions.map { |item| item[:message] }).to eq([events.last.stringify_keys])
  end

  it 'ignores invalid replay cursors and resume attempts without authorization' do
    channel.resume('after_sequence' => 0)
    expect(connection.transmissions).to be_empty

    allow(repository).to receive(:find_authorized).and_return(operation)
    channel.send(:subscribed)
    connection.transmissions.clear

    channel.resume('after_sequence' => 'invalid')
    channel.resume('after_sequence' => -1)

    expect(connection.transmissions).to be_empty
  end
end

# rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
