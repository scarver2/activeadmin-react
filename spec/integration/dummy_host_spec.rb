# spec/integration/dummy_host_spec.rb
# frozen_string_literal: true

# rubocop:disable RSpec/DescribeClass, RSpec/ExampleLength, RSpec/MultipleExpectations

require_relative '../rails_helper'
require 'capybara/rspec'
require_relative '../dummy/config/environment'

Capybara.app = ActiveAdminReactDummy::Application

RSpec.describe 'ActiveAdmin React dummy host' do
  include Capybara::DSL

  before do
    next if ActiveAdmin::React::Contributions.registry.to_a.any? { |entry| entry.name == 'engine-status' }

    ActiveAdmin::React::Contributions.register(
      'engine-status',
      source: 'dummy-engine',
      owner: 'activeadmin-react-dummy',
      display: 'Engine contribution'
    )
  end

  it 'boots ActiveAdmin and renders two islands from the installable gem' do
    visit '/admin/integration_demo'

    expect(page).to have_css('h1', text: 'React integration demo')
    expect(page).to have_css('[data-react-component="OrdersTable"]')
    expect(page).to have_css('[data-react-component="OrdersTable"][data-react-props]')
    expect(find('[data-react-component="OrdersTable"]')['data-react-props']).to include('"page":1')
    expect(page).to have_css('[data-react-component="EngineStatus"]')
    expect(page).to have_text('Orders are available without JavaScript.')
    expect(page).to have_text('Engine status is available without JavaScript.')
  end

  it 'keeps server fallback markup for an unknown component' do
    visit '/admin/integration_demo'

    expect(page).to have_css('[data-react-component="UnregisteredComponent"]')
    expect(page).to have_text('This unregistered island uses server fallback.')
  end

  it 'remounts deterministically after navigating away and back' do
    visit '/admin/integration_demo'
    first_islands = all('[data-react-component]').map do |island|
      [island['data-react-component'], island['data-react-props'], island.text]
    end

    visit '/admin'
    visit '/admin/integration_demo'

    remounted_islands = all('[data-react-component]').map do |island|
      [island['data-react-component'], island['data-react-props'], island.text]
    end

    expect(remounted_islands).to eq(first_islands)
  end

  it 'exposes the engine contribution through the public registry' do
    entry = ActiveAdmin::React::Contributions.registry.fetch('engine-status')

    expect(entry.source).to eq('dummy-engine')
    expect(entry.owner).to eq('activeadmin-react-dummy')
    expect(entry.metadata).to eq(display: 'Engine contribution')
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/ExampleLength, RSpec/MultipleExpectations
