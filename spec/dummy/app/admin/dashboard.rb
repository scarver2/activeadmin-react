# spec/dummy/app/admin/dashboard.rb
# frozen_string_literal: true

ActiveAdmin.register_page 'Dashboard' do
  content do
    h1 'Dummy dashboard'
  end
end
