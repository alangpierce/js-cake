// Fix any style issues and re-enable lint.
// `cake` is a simplified version of [Make](http://www.gnu.org/software/make/)
// ([Rake](http://rake.rubyforge.org/), [Jake](https://github.com/280north/jake))
// for CoffeeScript. You define tasks with names and descriptions in a Cakefile,
// and can call them from the command line, or invoke them from other tasks.
//
// Running `cake` with no arguments will print out a list of all the tasks in the
// current directory's Cakefile.

// External dependencies.
import fs from 'fs';
import path from 'path';
import requireUncached from 'require-uncached';

import * as helpers from './helpers';
import OptionParser from './optparse';

// Keep track of the list of defined tasks, the accepted options, and so on.
const tasks = {};
let options = {};
const switches = [];
let oparse = null;

// Mixin the top-level Cake functions for Cakefiles to use directly.
helpers.extend(global, {

  // Define a Cake task with a short name, an optional sentence description,
  // and the function to run as the action itself.
  task(name, description, action) {
    if (!action) {
      [action, description] = Array.from([description, action]);
    }
    tasks[name] = { name, description, action };
  },

  // Define an option that the Cakefile accepts. The parsed options hash,
  // containing all of the command-line options passed, will be made available
  // as the first argument to the action.
  option(letter, flag, description) {
    switches.push([letter, flag, description]);
  },

  // Invoke another task in the current Cakefile.
  invoke(name) {
    if (!tasks[name]) {
      missingTask(name);
    }
    tasks[name].action(options);
  },
});

// Run `cake`. Executes all of the tasks you pass, in order. Note that Node's
// asynchrony may cause tasks to execute in a different order than you'd expect.
// If no tasks are passed, print the help screen. Keep a reference to the
// original directory name, when running Cake tasks from subdirectories.
export default function run() {
  global.__originalDirname = fs.realpathSync('.');
  process.chdir(cakefileDirectory(__originalDirname));
  const args = process.argv.slice(2);
  require('babel-register');  // eslint-disable-line global-require
  requireUncached(path.resolve('Cakefile'));
  oparse = new OptionParser(switches);
  if (!args.length) { return printTasks(); }
  try {
    options = oparse.parse(args);
  } catch (e) {
    return fatalError(`${e}`);
  }
  return Array.from(options.arguments).map(arg => invoke(arg));
}

// Display the list of Cake tasks in a format similar to `rake -T`
function printTasks() {
  const relative = path.relative || path.resolve;
  const cakefilePath = path.join(relative(__originalDirname, process.cwd()), 'Cakefile.js');
  console.log(`${cakefilePath} defines the following tasks:\n`);
  for (const name of Object.keys(tasks)) {
    const task = tasks[name];
    let spaces = 20 - name.length;
    spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
    const desc = task.description ? `# ${task.description}` : '';
    console.log(`cake ${name}${spaces} ${desc}`);
  }
  if (switches.length) {
    console.log(oparse.help());
  }
}

// Print an error and exit when attempting to use an invalid task/option.
function fatalError(message) {
  console.error(`${message}\n`);
  console.log('To see a list of all tasks/options, run "cake"');
  return process.exit(1);
}

function missingTask(task) {
  fatalError(`No such task: ${task}`);
}

// When `cake` is invoked, search in the current and all parent directories
// to find the relevant Cakefile.
function cakefileDirectory(dir) {
  if (fs.existsSync(path.join(dir, 'Cakefile.js'))) { return dir; }
  const parent = path.normalize(path.join(dir, '..'));
  if (parent !== dir) { return cakefileDirectory(parent); }
  throw new Error(`Cakefile not found in ${process.cwd()}`);
}
