#!/usr/bin/env ruby
# bin/verify-package.rb
# frozen_string_literal: true

require 'rubygems/package'

package_file = ARGV.fetch(0)
files = Gem::Package.new(package_file).spec.files
required_files = %w[
  CHANGELOG.md
  LICENSE.txt
  README.md
  RELEASES.md
  app/javascript/active_admin/react/index.js
  app/javascript/active_admin/react/protocol.js
  lib/active_admin/react.rb
  sig/active_admin/react.rbs
]
forbidden_prefixes = %w[coverage/ node_modules/ spec/ test/ tmp/]

missing = required_files - files
forbidden = files.select { |file| forbidden_prefixes.any? { |prefix| file.start_with?(prefix) } }

abort "Missing packaged files: #{missing.join(', ')}" unless missing.empty?
abort "Development files packaged: #{forbidden.join(', ')}" unless forbidden.empty?

puts "Verified #{files.length} packaged files"
