// Repeat a string `n` times.
export function repeat(str, n) {
  // Use clever algorithm to have O(log(n)) string concatenation operations.
  let res = '';
  while (n > 0) {
    if (n & 1) { res += str; }
    n >>>= 1;
    str += str;
  }
  return res;
}

// Extend a source object with the properties of another object (shallow copy).
export function extend(object, properties) {
  for (const key of Object.keys(properties)) {
    const val = properties[key];
    object[key] = val;
  }
  return object;
}
