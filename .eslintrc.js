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
    "no-console": 0,
    "no-param-reassign": 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": ["error", {
      "functions": false,
    }],
  }
};
