# frozen_string_literal: true

module ActiveAdmin
  module React
    # Adds the Arbre DSL entry point for rendering a React island.
    module Arbre
      def react_component(component, props: {}, fallback: nil, **html)
        mount = ActiveAdmin::React::Mount.new(component, props: props, fallback: fallback, html: html)
        div(**mount.attributes) do
          text_node fallback.call if fallback.respond_to?(:call)
        end
      end
    end
  end
end
