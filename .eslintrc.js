module.exports = {
  "extends": "airbnb-base",
  "globals": {
    "task": true,
    "option": true,
    "invoke": true,
    "__originalDirname": true,
  },
  "plugins": [
    "import"
  ],
  "rules": {
    "camelcase": 0,
    "no-bitwise": 0,
    "no-cond-assign": 0,
    "no-console": 0,
    "no-continue": 0,
    "no-else-return": 0,
    "no-multi-assign": 0,
    "no-param-reassign": 0,
    "no-plusplus": 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": ["error", {
      "functions": false,
    }],
  }
};
