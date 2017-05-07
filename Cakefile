import { execSync } from 'child_process';

function run(command) {
  console.log(`> ${command}`);
  try {
    console.log(execSync(command).toString());
  } catch (e) {
    throw new Error(
      `Error while running ${command}.\nstdout: ${e.stdout}\nstderr: ${e.stderr}`);
  }
}

task('build', 'build js-cake', () => {
  run('./node_modules/.bin/eslint Cakefile src');
  run('./node_modules/.bin/rollup -c');
});

task('test', 'run the js-cake tests', () => {
  console.log('TODO');
});
