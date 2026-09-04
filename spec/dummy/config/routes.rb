# spec/dummy/config/routes.rb
# frozen_string_literal: true

ActiveAdminReactDummy::Application.routes.draw do
  mount ActionCable.server => '/cable'
  ActiveAdmin.routes(self)
  root to: redirect('/admin/integration_demo')
end
