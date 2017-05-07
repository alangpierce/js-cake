import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

const pkg = require('./package.json');

export default {
  entry: 'src/cake.js',
  plugins: [
    babel(babelrc()),
  ],
  targets: [
    {
      format: 'cjs',
      dest: pkg.main,
    },
    {
      format: 'es',
      dest: pkg.module,
    },
  ],
};
