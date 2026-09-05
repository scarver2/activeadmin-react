# spec/dummy/lib/demo_operation_repository.rb
# frozen_string_literal: true

require 'securerandom'

# Process-local demonstration storage, never a production persistence adapter.
class DemoOperationRepository
  class Operation
    attr_reader :id, :tenant_id, :user_id

    def initialize(tenant_id:, user_id:)
      @id = SecureRandom.uuid
      @tenant_id = tenant_id
      @user_id = user_id
      @events = []
      @mutex = Mutex.new
      append(state: 'pending', progress: 0)
    end

    def broadcast_key
      "operations:#{tenant_id}:#{id}"
    end

    def snapshot
      @mutex.synchronize { @events.last.dup }
    end

    def events_after(sequence)
      @mutex.synchronize { @events.select { |event| event[:sequence] > sequence }.map(&:dup) }
    end

    def append(state:, progress:)
      @mutex.synchronize do
        sequence = @events.length + 1
        event = { operation_id: id, idempotency_key: "#{id}:#{sequence}", sequence: sequence,
                  state: state, progress: progress, message: "Demo #{state}" }
        @events << event.freeze
        event.dup
      end
    end
  end

  def initialize
    @operations = {}
    @mutex = Mutex.new
  end

  def create(tenant_id:, user_id:)
    operation = Operation.new(tenant_id: tenant_id, user_id: user_id)
    @mutex.synchronize { @operations[operation.id] = operation }
    operation
  end

  def find_authorized(operation_id:, tenant_id:, user_id:)
    operation = @mutex.synchronize { @operations[operation_id] }
    operation if operation&.tenant_id == tenant_id && operation&.user_id == user_id
  end
end
