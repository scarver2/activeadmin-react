# frozen_string_literal: true

require "active_admin/react"

RSpec.describe ActiveAdmin::React do
  it "exposes a prerelease version" do
    expect(ActiveAdmin::React::VERSION).to match(/\A\d+\.\d+\.\d+\.alpha\d+\z/)
  end
end
