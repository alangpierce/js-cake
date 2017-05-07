/* eslint-disable
    consistent-return,
    func-names,
    no-console,
    no-param-reassign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const spawnNodeProcess = function (args, output, callback) {
  if (output == null) { output = 'stderr'; }
  const relayOutput = buffer => console.log(buffer.toString());
  const proc = spawn('node', args);
  if ((output === 'both') || (output === 'stdout')) { proc.stdout.on('data', relayOutput); }
  if ((output === 'both') || (output === 'stderr')) { proc.stderr.on('data', relayOutput); }
  return proc.on('exit', (status) => { if (typeof callback === 'function') { return callback(status); } });
};

// Run a CoffeeScript through our node/coffee interpreter.
const run = (args, callback) =>
  spawnNodeProcess(['bin/coffee'].concat(args), 'stderr', (status) => {
    if (status !== 0) { process.exit(1); }
    if (typeof callback === 'function') { return callback(); }
  })
;

task('build', 'build js-cake', () => console.log('TODO'));

task('test', 'run the js-cake tests', () => console.log('TODO'));
