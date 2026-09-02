# frozen_string_literal: true

require_relative "lib/active_admin/react/version"

Gem::Specification.new do |spec|
  spec.name = "activeadmin-react"
  spec.version = ActiveAdmin::React::VERSION
  spec.authors = ["Stan Carver II"]
  spec.summary = "React islands for ActiveAdmin"
  spec.description = "An Arbre-native bridge for mounting optional React components inside ActiveAdmin while keeping ActiveAdmin Rails-first and server-rendered."
  spec.homepage = "https://github.com/scarver2/activeadmin-react"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.2"

  spec.files = Dir["lib/**/*", "LICENSE.txt", "README.md"]
  spec.require_paths = ["lib"]

  spec.add_dependency "activeadmin", ">= 4.0.0.beta22", "< 5"
  spec.add_dependency "rails", ">= 8.0", "< 9"
end
