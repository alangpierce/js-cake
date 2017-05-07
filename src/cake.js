/* eslint-disable
    consistent-return,
    func-names,
    guard-for-in,
    import/extensions,
    import/no-named-as-default-member,
    import/no-unresolved,
    import/prefer-default-export,
    no-console,
    no-param-reassign,
    no-restricted-syntax,
    no-return-assign,
    no-undef,
    no-underscore-dangle,
    no-use-before-define,
    no-var,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
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
import helpers from './helpers';
import optparse from './optparse';
import CoffeeScript from './coffee-script';

// Register .coffee extension
CoffeeScript.register();

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
    if (!action) { [action, description] = Array.from([description, action]); }
    return tasks[name] = { name, description, action };
  },

  // Define an option that the Cakefile accepts. The parsed options hash,
  // containing all of the command-line options passed, will be made available
  // as the first argument to the action.
  option(letter, flag, description) {
    return switches.push([letter, flag, description]);
  },

  // Invoke another task in the current Cakefile.
  invoke(name) {
    if (!tasks[name]) { missingTask(name); }
    return tasks[name].action(options);
  },
},
);

// Run `cake`. Executes all of the tasks you pass, in order. Note that Node's
// asynchrony may cause tasks to execute in a different order than you'd expect.
// If no tasks are passed, print the help screen. Keep a reference to the
// original directory name, when running Cake tasks from subdirectories.
export function run() {
  global.__originalDirname = fs.realpathSync('.');
  process.chdir(cakefileDirectory(__originalDirname));
  const args = process.argv.slice(2);
  CoffeeScript.run(fs.readFileSync('Cakefile').toString(), { filename: 'Cakefile' });
  oparse = new optparse.OptionParser(switches);
  if (!args.length) { return printTasks(); }
  try {
    options = oparse.parse(args);
  } catch (e) {
    return fatalError(`${e}`);
  }
  return Array.from(options.arguments).map(arg => invoke(arg));
}

// Display the list of Cake tasks in a format similar to `rake -T`
var printTasks = function () {
  const relative = path.relative || path.resolve;
  const cakefilePath = path.join(relative(__originalDirname, process.cwd()), 'Cakefile');
  console.log(`${cakefilePath} defines the following tasks:\n`);
  for (const name in tasks) {
    const task = tasks[name];
    let spaces = 20 - name.length;
    spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
    const desc = task.description ? `# ${task.description}` : '';
    console.log(`cake ${name}${spaces} ${desc}`);
  }
  if (switches.length) { return console.log(oparse.help()); }
};

// Print an error and exit when attempting to use an invalid task/option.
var fatalError = function (message) {
  console.error(`${message}\n`);
  console.log('To see a list of all tasks/options, run "cake"');
  return process.exit(1);
};

var missingTask = task => fatalError(`No such task: ${task}`);

// When `cake` is invoked, search in the current and all parent directories
// to find the relevant Cakefile.
var cakefileDirectory = function (dir) {
  if (fs.existsSync(path.join(dir, 'Cakefile'))) { return dir; }
  const parent = path.normalize(path.join(dir, '..'));
  if (parent !== dir) { return cakefileDirectory(parent); }
  throw new Error(`Cakefile not found in ${process.cwd()}`);
};
