# spec/fixtures/react_mount_attributes.rb
# frozen_string_literal: true

require 'json'

module ReactMountAttributes
  def react_mount_attributes(page:, **html)
    html.merge(
      data: {
        'react-component' => 'OrdersTable',
        'react-props' => JSON.generate(page: page)
      }
    )
  end
end
