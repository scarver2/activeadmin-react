# frozen_string_literal: true

require 'json'
require 'date'

module ActiveAdmin
  module React
    # Builds immutable HTML attributes for a React island and retains its fallback.
    class Mount
      DATA_COMPONENT = 'react-component'
      DATA_PROPS = 'react-props'
      COMPONENT_PATTERN = /\A[A-Za-z][A-Za-z0-9._-]*\z/

      def initialize(component, props: {}, fallback: nil, html: {})
        @component = normalize_component(component)
        @props = normalize_props(props)
        @fallback = fallback
        @html = html.dup
      end

      def attributes
        data = html_data.merge(
          DATA_COMPONENT => @component,
          DATA_PROPS => props_json
        )

        @html.merge(data: data)
      end

      attr_reader :fallback

      private

      def normalize_component(component)
        return component.to_s if component.is_a?(String) && component.match?(COMPONENT_PATTERN)
        return component.to_s if component.is_a?(Symbol) && component.to_s.match?(COMPONENT_PATTERN)

        raise ArgumentError, 'component must be a non-empty Ruby identifier'
      end

      def html_data
        data = @html.fetch(:data, {})
        raise ArgumentError, 'html data must be a Hash' unless data.is_a?(Hash)

        data.dup
      end

      def props_json
        @props_json ||= JSON.generate(@props)
      end

      # Keep the accepted prop grammar explicit so unsupported objects fail closed.
      # rubocop:disable-next Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
      def normalize_props(value)
        case value
        when NilClass, TrueClass, FalseClass, String, Integer, Symbol
          value.is_a?(Symbol) ? value.to_s : value
        when Float
          raise ArgumentError, 'props cannot contain a non-finite Float' unless value.finite?

          value
        when DateTime, Time
          value.iso8601(6)
        when Date
          value.iso8601
        when Array
          value.map { |item| normalize_props(item) }
        when Hash
          value.to_h do |key, item|
            unless key.is_a?(String) || key.is_a?(Symbol)
              raise ArgumentError, 'props Hash keys must be Strings or Symbols'
            end

            [key.to_s, normalize_props(item)]
          end
        else
          raise ArgumentError, "unsupported prop type: #{value.class}"
        end
      end
    end
  end
end
