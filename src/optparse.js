import { repeat } from './helpers';

// Regex matchers for option flags.
const LONG_FLAG = /^(--\w[\w-]*)/;
const SHORT_FLAG = /^(-\w)$/;
const MULTI_FLAG = /^-(\w{2,})/;
const OPTIONAL = /\[(\w+(\*?))\]/;

// A simple **OptionParser** class to parse option flags from the command-line.
// Use it like so:
//
//     parser  = new OptionParser switches, helpBanner
//     options = parser.parse process.argv
//
// The first non-option is considered to be the start of the file (and file
// option) list, and all subsequent arguments are left unparsed.
export default class OptionParser {

  // Initialize with a list of valid options, in the form:
  //
  //     [short-flag, long-flag, description]
  //
  // Along with an optional banner for the usage help.
  constructor(rules, banner) {
    this.banner = banner;
    this.rules = buildRules(rules);
  }

  // Parse the list of arguments, populating an `options` object with all of the
  // specified options, and return it. Options after the first non-option
  // argument are treated as arguments. `options.arguments` will be an array
  // containing the remaining arguments. This is a simpler API than many option
  // parsers that allow you to attach callback actions for every flag. Instead,
  // you're responsible for interpreting the options object.
  parse(args) {
    const options = { arguments: [] };
    let skippingArgument = false;
    const originalArgs = args;
    args = normalizeArguments(args);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (skippingArgument) {
        skippingArgument = false;
        continue;
      }
      if (arg === '--') {
        const pos = originalArgs.indexOf('--');
        options.arguments = options.arguments.concat(originalArgs.slice((pos + 1)));
        break;
      }
      const isOption = !!(arg.match(LONG_FLAG) || arg.match(SHORT_FLAG));
      // the CS option parser is a little odd; options after the first
      // non-option argument are treated as non-option arguments themselves
      const seenNonOptionArg = options.arguments.length > 0;
      if (!seenNonOptionArg) {
        let matchedRule = false;
        for (const rule of Array.from(this.rules)) {
          if ((rule.shortFlag === arg) || (rule.longFlag === arg)) {
            let value = true;
            if (rule.hasArgument) {
              skippingArgument = true;
              value = args[i + 1];
            }
            options[rule.name] = rule.isList ? (options[rule.name] || []).concat(value) : value;
            matchedRule = true;
            break;
          }
        }
        if (isOption && !matchedRule) { throw new Error(`unrecognized option: ${arg}`); }
      }
      if (seenNonOptionArg || !isOption) {
        options.arguments.push(arg);
      }
    }
    return options;
  }

  // Return the help text for this **OptionParser**, listing and describing all
  // of the valid options, for `--help` and such.
  help() {
    const lines = [];
    if (this.banner) { lines.unshift(`${this.banner}\n`); }
    for (const rule of Array.from(this.rules)) {
      let spaces = 15 - rule.longFlag.length;
      spaces = spaces > 0 ? repeat(' ', spaces) : '';
      const letPart = rule.shortFlag ? `${rule.shortFlag}, ` : '    ';
      lines.push(`  ${letPart}${rule.longFlag}${spaces}${rule.description}`);
    }
    return `\n${lines.join('\n')}\n`;
  }
}

// Helpers
// -------

// Build and return the list of option rules. If the optional *short-flag* is
// unspecified, leave it out by padding with `null`.
function buildRules(rules) {
  return (() => {
    const result = [];
    for (const tuple of Array.from(rules)) {
      if (tuple.length < 3) {
        tuple.unshift(null);
      }
      result.push(buildRule(...Array.from(tuple || [])));
    }
    return result;
  })();
};

// Build a rule from a `-o` short flag, a `--output [DIR]` long flag, and the
// description of what the option does.
function buildRule(shortFlag, longFlag, description, options) {
  if (options == null) { options = {}; }
  const match = longFlag.match(OPTIONAL);
  longFlag = longFlag.match(LONG_FLAG)[1];
  return {
    name: longFlag.substr(2),
    shortFlag,
    longFlag,
    description,
    hasArgument: !!(match && match[1]),
    isList: !!(match && match[2]),
  };
}

// Normalize arguments by expanding merged flags into multiple flags. This allows
// you to have `-wl` be the same as `--watch --lint`.
function normalizeArguments(args) {
  args = args.slice();
  const result = [];
  for (const arg of Array.from(args)) {
    let match;
    if ((match = arg.match(MULTI_FLAG))) {
      for (const l of Array.from(match[1].split(''))) { result.push(`-${l}`); }
    } else {
      result.push(arg);
    }
  }
  return result;
};
