# frozen_string_literal: true

module ActiveAdmin
  module React
    class Registry
      Entry = Data.define(:name, :source, :owner, :metadata)

      def initialize
        @entries = {}
      end

      def register(name, source:, owner:, **metadata)
        key = name.to_s
        raise ActiveAdmin::React::Error, "component already registered: #{key}" if @entries.key?(key)

        @entries[key] = Entry.new(name: key, source: source.to_s, owner: owner.to_s, metadata: metadata.freeze)
      end

      def fetch(name)
        @entries.fetch(name.to_s)
      end

      def each(&block)
        @entries.values.each(&block)
      end

      def to_a
        @entries.values
      end
    end
  end
end
