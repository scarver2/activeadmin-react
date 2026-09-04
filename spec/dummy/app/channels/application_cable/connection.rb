# spec/dummy/app/channels/application_cable/connection.rb
# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_tenant_id, :current_user_id

    attr_accessor :operation_repository

    def connect
      self.current_tenant_id = request.env['activeadmin_react.current_tenant_id']
      self.current_user_id = request.env['activeadmin_react.current_user_id']
      self.operation_repository = request.env['activeadmin_react.operation_repository']
      reject_unauthorized_connection unless current_tenant_id && current_user_id && operation_repository
    end
  end
end
