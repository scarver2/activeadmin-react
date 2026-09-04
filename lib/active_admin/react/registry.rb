# lib/active_admin/react/registry.rb
# frozen_string_literal: true

module ActiveAdmin
  module React
    # Stores namespaced component contributions with copied, immutable metadata.
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
          metadata: immutable_metadata(attributes)
        ).freeze
      end

      def immutable_metadata(value, ancestors = Set.new)
        return value.dup.freeze if value.is_a?(String)
        return value unless metadata_container?(value)

        object_id = value.object_id
        raise ActiveAdmin::React::Error, 'metadata must not contain cyclic containers' if ancestors.include?(object_id)

        nested_ancestors = ancestors.dup.add(object_id)
        return immutable_hash(value, nested_ancestors) if value.is_a?(Hash)
        return immutable_array(value, nested_ancestors) if value.is_a?(Array)

        immutable_set(value, nested_ancestors)
      end

      def immutable_hash(value, ancestors)
        value.each_with_object({}) do |(key, nested_value), copy|
          copy[immutable_metadata(key, ancestors)] = immutable_metadata(nested_value, ancestors)
        end.freeze
      end

      def immutable_array(value, ancestors)
        value.map { |nested_value| immutable_metadata(nested_value, ancestors) }.freeze
      end

      def immutable_set(value, ancestors)
        value.each_with_object(Set.new) do |nested_value, copy|
          copy << immutable_metadata(nested_value, ancestors)
        end.freeze
      end

      def metadata_container?(value)
        value.is_a?(Hash) || value.is_a?(Array) || value.is_a?(Set)
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
