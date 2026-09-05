# spec/dummy/lib/demo_identity.rb
# frozen_string_literal: true

# Explicit synthetic identity for the opt-in browser fixture, not authentication.
class DemoIdentity
  def initialize(app, repository)
    @app = app
    @repository = repository
  end

  def call(env)
    env['activeadmin_react.current_tenant_id'] = 'dummy-tenant'
    env['activeadmin_react.current_user_id'] = 'dummy-user'
    env['activeadmin_react.operation_repository'] = @repository
    @app.call(env)
  end
end
