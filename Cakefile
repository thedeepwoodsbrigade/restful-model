{spawn, exec} = require 'child_process'

task 'dev', 'continually build', ->
    src_build = spawn 'coffee', ['-m', '-cw', '-o', 'src', 'src']
    src_build.stdout.on 'data', (data) -> console.log data.toString().trim()
    spec_build = spawn 'coffee', ['-m', '-cw', '-o', 'spec', 'spec']
    spec_build.stdout.on 'data', (data) -> console.log data.toString().trim()