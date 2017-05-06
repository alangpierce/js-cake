fs        = require 'fs'
path      = require 'path'
{ spawn } = require 'child_process'

spawnNodeProcess = (args, output = 'stderr', callback) ->
  relayOutput = (buffer) -> console.log buffer.toString()
  proc =         spawn 'node', args
  proc.stdout.on 'data', relayOutput if output is 'both' or output is 'stdout'
  proc.stderr.on 'data', relayOutput if output is 'both' or output is 'stderr'
  proc.on        'exit', (status) -> callback(status) if typeof callback is 'function'

# Run a CoffeeScript through our node/coffee interpreter.
run = (args, callback) ->
  spawnNodeProcess ['bin/coffee'].concat(args), 'stderr', (status) ->
    process.exit(1) if status isnt 0
    callback() if typeof callback is 'function'

task 'build', 'build js-cake', ->
  console.log 'TODO'

task 'test', 'run the js-cake tests', ->
  console.log 'TODO'
