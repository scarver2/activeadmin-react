# frozen_string_literal: true

module ActiveAdmin
  module React
    # Adds the Arbre DSL entry point for rendering a React island.
    module Arbre
      def react_component(component, props: {}, fallback: nil, **html)
        mount = ActiveAdmin::React::Mount.new(component, props: props, fallback: fallback, html: html)
        attributes = mount.attributes
        if fallback.respond_to?(:call)
          attributes['aria-live'] = 'polite' unless attributes.key?('aria-live') || attributes.key?(:'aria-live')
          attributes['role'] = 'status' unless attributes.key?('role') || attributes.key?(:role)
        end

        div(**attributes) do
          text_node fallback.call if fallback.respond_to?(:call)
        end
      end
    end
  end
end
