# spec/dummy/config/routes.rb
# frozen_string_literal: true

ActiveAdminReactDummy::Application.routes.draw do
  ActiveAdmin.routes(self)
  root to: redirect('/admin/integration_demo')
end
