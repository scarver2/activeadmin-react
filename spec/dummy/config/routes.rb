# spec/dummy/config/routes.rb
# frozen_string_literal: true

ActiveAdminReactDummy::Application.routes.draw do
  if ENV['ACTIVEADMIN_REACT_BROWSER_TEST'] == '1'
    resources :operations, path: 'demo/operations', controller: 'demo_operations', only: %i[create show update] do
      post :rebroadcast, on: :member
    end
  end
  mount ActionCable.server => '/cable'
  ActiveAdmin.routes(self)
  root to: redirect('/admin/integration_demo')
end
