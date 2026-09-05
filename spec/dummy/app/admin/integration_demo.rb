# spec/dummy/app/admin/integration_demo.rb
# frozen_string_literal: true

ActiveAdmin.register_page 'Integration Demo' do
  menu priority: 0

  content do
    h1 'React integration demo'
    react_component('DemoOperation', fallback: -> { 'Operation demo requires JavaScript.' }) if
      ENV['ACTIVEADMIN_REACT_BROWSER_TEST'] == '1'

    div id: 'island-region' do
      react_component(
        'OrdersTable',
        props: { page: 1, source: 'dummy' },
        fallback: -> { 'Orders are available without JavaScript.' },
        class: 'orders-island'
      )
      react_component(
        'EngineStatus',
        props: ActiveAdmin::React::Contributions.registry.fetch('EngineStatus').metadata,
        fallback: -> { 'Engine status is available without JavaScript.' },
        class: 'engine-island'
      )
      if params[:failure] == 'unknown'
        react_component(
          'UnregisteredComponent',
          props: { safe: true },
          fallback: -> { 'This unregistered island uses server fallback.' },
          class: 'fallback-island'
        )
      end

      if params[:failure] == 'malformed'
        div 'Malformed props fallback.', 'data-react-component': 'OrdersTable', 'data-react-props': '{broken'
      end
    end
  end
end
