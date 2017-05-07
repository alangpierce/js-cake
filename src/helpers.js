// This file contains the common helper functions that we'd like to share among
// the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
// arrays, count characters, that sort of thing.

// Peek at the beginning of a given string to see if it matches a sequence.
let flatten, repeat;
export function starts(string, literal, start) {
  return literal === string.substr(start, literal.length);
}

// Peek at the end of a given string to see if it matches a sequence.
export function ends(string, literal, back) {
  let len = literal.length;
  return literal === string.substr(string.length - len - (back || 0), len);
}

// Repeat a string `n` times.
let repeat$1 = (repeat = function(str, n) {
  // Use clever algorithm to have O(log(n)) string concatenation operations.
  let res = '';
  while (n > 0) {
    if (n & 1) { res += str; }
    n >>>= 1;
    str += str;
  }
  return res;
});

// Trim out all falsy values from an array.
export function compact(array) {
  return Array.from(array).filter((item) => item).map((item) => item);
}

// Count the number of occurrences of a string in a string.
export function count(string, substr) {
  let pos;
  let num = (pos = 0);
  if (!substr.length) { return 1/0; }
  while ((pos = 1 + string.indexOf(substr, pos))) { num++; }
  return num;
}

// Merge objects, returning a fresh copy with attributes from both sides.
// Used every time `Base#compile` is called, to allow properties in the
// options hash to propagate down the tree without polluting other branches.
export function merge(options, overrides) {
  return extend((extend({}, options)), overrides);
}

// Extend a source object with the properties of another object (shallow copy).
var extend = (exports.extend = function(object, properties) {
  for (let key in properties) {
    let val = properties[key];
    object[key] = val;
  }
  return object;
});

// Return a flattened version of an array.
// Handy for getting a list of `children` from the nodes.
let flatten$1 = (flatten = function(array) {
  let flattened = [];
  for (let element of Array.from(array)) {
    if ('[object Array]' === Object.prototype.toString.call(element)) {
      flattened = flattened.concat(flatten(element));
    } else {
      flattened.push(element);
    }
  }
  return flattened;
});

// Delete a key from an object, returning the value. Useful when a node is
// looking for a particular method in an options hash.
export function del(obj, key) {
  let val =  obj[key];
  delete obj[key];
  return val;
}

// Typical Array::some
export let some = Array.prototype.some != null ? Array.prototype.some : function(fn) {
  for (let e of Array.from(this)) { if (fn(e)) { return true; } }
  return false;
};

// Simple function for inverting Literate CoffeeScript code by putting the
// documentation in comments, producing a string of CoffeeScript code that
// can be compiled "normally".
export function invertLiterate(code) {
  let maybe_code = true;
  let lines = Array.from(code.split('\n')).map((line) =>
    maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line) ?
      line
    : (maybe_code = /^\s*$/.test(line)) ?
      line
    :
      `# ${line}`);
  return lines.join('\n');
}

// Merge two jison-style location data objects together.
// If `last` is not provided, this will simply return `first`.
let buildLocationData = function(first, last) {
  if (!last) {
    return first;
  } else {
    return {
      first_line: first.first_line,
      first_column: first.first_column,
      last_line: last.last_line,
      last_column: last.last_column
    };
  }
};

// This returns a function which takes an object as a parameter, and if that
// object is an AST node, updates that object's locationData.
// The object is returned either way.
export function addLocationDataFn(first, last) {
  return function(obj) {
    if (((typeof obj) === 'object') && (!!obj['updateLocationDataIfMissing'])) {
      obj.updateLocationDataIfMissing(buildLocationData(first, last));
    }

    return obj;
  };
}

// Convert jison location data to a string.
// `obj` can be a token, or a locationData.
export function locationDataToString(obj) {
  let locationData;
  if (("2" in obj) && ("first_line" in obj[2])) { locationData = obj[2];
  } else if ("first_line" in obj) { locationData = obj; }

  if (locationData) {
    return `${locationData.first_line + 1}:${locationData.first_column + 1}-` +
    `${locationData.last_line + 1}:${locationData.last_column + 1}`;
  } else {
    return "No location data";
  }
}

// A `.coffee.md` compatible version of `basename`, that returns the file sans-extension.
export function baseFileName(file, stripExt, useWinPathSep) {
  if (stripExt == null) { stripExt = false; }
  if (useWinPathSep == null) { useWinPathSep = false; }
  let pathSep = useWinPathSep ? /\\|\// : /\//;
  let parts = file.split(pathSep);
  file = parts[parts.length - 1];
  if (!stripExt || !(file.indexOf('.') >= 0)) { return file; }
  parts = file.split('.');
  parts.pop();
  if ((parts[parts.length - 1] === 'coffee') && (parts.length > 1)) { parts.pop(); }
  return parts.join('.');
}

// Determine if a filename represents a CoffeeScript file.
export function isCoffee(file) { return /\.((lit)?coffee|coffee\.md)$/.test(file); }

// Determine if a filename represents a Literate CoffeeScript file.
export function isLiterate(file) { return /\.(litcoffee|coffee\.md)$/.test(file); }

// Throws a SyntaxError from a given location.
// The error's `toString` will return an error message following the "standard"
// format `<filename>:<line>:<col>: <message>` plus the line with the error and a
// marker showing where the error is.
export function throwSyntaxError(message, location) {
  let error = new SyntaxError(message);
  error.location = location;
  error.toString = syntaxErrorToString;

  // Instead of showing the compiler's stacktrace, show our custom error message
  // (this is useful when the error bubbles up in Node.js applications that
  // compile CoffeeScript for example).
  error.stack = error.toString();

  throw error;
}

// Update a compiler SyntaxError with source code information if it didn't have
// it already.
export function updateSyntaxError(error, code, filename) {
  // Avoid screwing up the `stack` property of other errors (i.e. possible bugs).
  if (error.toString === syntaxErrorToString) {
    if (!error.code) { error.code = code; }
    if (!error.filename) { error.filename = filename; }
    error.stack = error.toString();
  }
  return error;
}

var syntaxErrorToString = function() {
  let colorsEnabled;
  if (!this.code || !this.location) { return Error.prototype.toString.call(this); }

  let {first_line, first_column, last_line, last_column} = this.location;
  if (last_line == null) { last_line = first_line; }
  if (last_column == null) { last_column = first_column; }

  let filename = this.filename || '[stdin]';
  let codeLine = this.code.split('\n')[first_line];
  let start    = first_column;
  // Show only the first line on multi-line errors.
  let end      = first_line === last_line ? last_column + 1 : codeLine.length;
  let marker   = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);

  // Check to see if we're running on a color-enabled TTY.
  if (typeof process !== 'undefined' && process !== null) {
    colorsEnabled = (process.stdout != null ? process.stdout.isTTY : undefined) && !(process.env != null ? process.env.NODE_DISABLE_COLORS : undefined);
  }

  if (this.colorful != null ? this.colorful : colorsEnabled) {
    let colorize = str => `\x1B[1;31m${str}\x1B[0m`;
    codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
    marker   = colorize(marker);
  }

  return `\
${filename}:${first_line + 1}:${first_column + 1}: error: ${this.message}
${codeLine}
${marker}\
`;
};

export function nameWhitespaceCharacter(string) {
  switch (string) {
    case ' ': return 'space';
    case '\n': return 'newline';
    case '\r': return 'carriage return';
    case '\t': return 'tab';
    default: return string;
  }
}
