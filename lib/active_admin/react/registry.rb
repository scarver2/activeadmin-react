# lib/active_admin/react/registry.rb
# frozen_string_literal: true

module ActiveAdmin
  module React
    # Stores namespaced component contributions with immutable metadata.
    class Registry
      include Enumerable

      Entry = Data.define(:name, :namespace, :source, :owner, :surfaces, :metadata) do
        def provenance
          "#{owner.inspect} in namespace #{namespace.inspect} from #{source.inspect}"
        end
      end

      def initialize
        @entries = {}
      end

      def register(name, **attributes)
        entry = build_entry(name, attributes)
        raise_conflict(entry) if @entries.key?(entry.name)

        @entries[entry.name] = entry
      end

      def fetch(name)
        @entries.fetch(name.to_s)
      end

      def each(&)
        ordered_entries.each(&)
      end

      def to_a
        ordered_entries
      end

      def registered?(name)
        @entries.key?(name.to_s.strip)
      end

      def diagnostics
        ordered_entries.map do |entry|
          {
            name: entry.name,
            namespace: entry.namespace,
            owner: entry.owner,
            source: entry.source,
            surfaces: entry.surfaces,
            metadata: entry.metadata
          }.freeze
        end.freeze
      end

      private

      def build_entry(name, attributes)
        surfaces = attributes.delete(:surfaces) { [:component] }
        Entry.new(
          name: normalize_required(name, :name),
          namespace: normalize_attribute(attributes, :namespace),
          source: normalize_attribute(attributes, :source),
          owner: normalize_attribute(attributes, :owner),
          surfaces: normalize_surfaces(surfaces),
          metadata: attributes.freeze
        ).freeze
      end

      def normalize_attribute(attributes, field)
        normalize_required(attributes.delete(field), field)
      end

      def normalize_required(value, field)
        normalized = value.to_s.strip
        raise ActiveAdmin::React::Error, "#{field} must be present" if normalized.empty?

        normalized
      end

      def normalize_surfaces(surfaces)
        normalized = Array(surfaces).map { |surface| normalize_required(surface, :surface).to_sym }.uniq.sort.freeze
        raise ActiveAdmin::React::Error, 'surfaces must not be empty' if normalized.empty?

        normalized
      end

      def ordered_entries
        @entries.values.sort_by { |entry| [entry.namespace, entry.name, entry.owner] }.freeze
      end

      def raise_conflict(incoming)
        existing = @entries.fetch(incoming.name)
        message = "component #{incoming.name.inspect} is owned by #{existing.provenance}; " \
                  "attempted owner #{incoming.provenance}"
        raise ActiveAdmin::React::Error, message
      end
    end
  end
end
