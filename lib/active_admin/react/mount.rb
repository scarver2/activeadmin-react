# frozen_string_literal: true

require 'json'

module ActiveAdmin
  module React
    class Mount
      DATA_COMPONENT = 'react-component'
      DATA_PROPS = 'react-props'

      def initialize(component, props: {}, fallback: nil, html: {})
        @component = component.to_s
        @props = props
        @fallback = fallback
        @html = html
      end

      def attributes
        data = (@html[:data] || {}).merge(
          DATA_COMPONENT => @component,
          DATA_PROPS => JSON.generate(@props)
        )

        @html.merge(data: data)
      end

      attr_reader :fallback
    end
  end
end
