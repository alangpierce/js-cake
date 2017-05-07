import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

let spawnNodeProcess = function(args, output, callback) {
  if (output == null) { output = 'stderr'; }
  let relayOutput = buffer => console.log(buffer.toString());
  let proc =         spawn('node', args);
  if ((output === 'both') || (output === 'stdout')) { proc.stdout.on('data', relayOutput); }
  if ((output === 'both') || (output === 'stderr')) { proc.stderr.on('data', relayOutput); }
  return proc.on('exit', function(status) { if (typeof callback === 'function') { return callback(status); } });
};

// Run a CoffeeScript through our node/coffee interpreter.
let run = (args, callback) =>
  spawnNodeProcess(['bin/coffee'].concat(args), 'stderr', function(status) {
    if (status !== 0) { process.exit(1); }
    if (typeof callback === 'function') { return callback(); }
  })
;

task('build', 'build js-cake', () => console.log('TODO'));

task('test', 'run the js-cake tests', () => console.log('TODO'));
