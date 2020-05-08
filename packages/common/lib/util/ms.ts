/**
 * * Presents a full-on module for working with miliseconds and formatted dates.
 * * Based off of https://github.com/zeit/ms, licensed under the MIT license
 * * Full credits to zeit & all other contributors.
 */

const s = 1000,
  m = s * 60,
  h = m * 60,
  d = h * 24,
  w = d * 7,
  y = d * 365.25,
  separators = [' ', '.', ','];

/**
 * @api private
 */
function plural(ms: number, msAbs: number, n: number, name: string): string {
  const isPlural = msAbs >= n * 1.5;
  return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}

/**
 * @api private
 */
function tokenize(str: string): string[] {
  const units = [];
  let buf = '';
  let sawLetter = false;

  for (const c of str) {
    if (!separators.includes(c)) {
      buf += c;
    } else if (isNaN(Number(c))) {
      sawLetter = true;
      buf += c;
    } else {
      if (sawLetter) {
        units.push(buf.trim());
        buf = '';
      }
      sawLetter = false;
      buf += c;
    }
  }

  if (buf.length) {
    units.push(buf.trim());
  }

  return units;
}

/**
 * @api private
 */
function parseString(str: string): number | null {
  str = String(str);
  if (str.length > 100) return null;

  const match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return null;

  const n = parseFloat(match[1]);
  const type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return null;
  }
}

/**
 * @api private
 */
function fmtLong(ms: number): string {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) return plural(ms, msAbs, d, 'day');
  if (msAbs >= h) return plural(ms, msAbs, h, 'hour');
  if (msAbs >= m) return plural(ms, msAbs, m, 'minute');
  if (msAbs >= s) return plural(ms, msAbs, s, 'second');
  return `${ms}`;
}

/**
 * @api private
 */
function fmtShort(ms: number): string {
  const msAbs = Math.abs(ms);
  if (msAbs >= d) return `${Math.round(ms / d)}d`;
  if (msAbs >= h) return `${Math.round(ms / h)}h`;
  if (msAbs >= m) return `${Math.round(ms / m)}m`;
  if (msAbs >= s) return `${Math.round(ms / s)}s`;
  return `${ms}ms`;
}

/**
 * @api private
 */
function parse(str: string): number | null {
  const units = tokenize(str);
  if (!units.length) return null;

  let ms = 0;
  let parsed;
  for (const unit of units) {
    parsed = parseString(unit);
    if (parsed === null) return null;
    ms += parsed;
  }

  return ms;
}

function ms(val: string): number | null;
function ms(val: number, long?: boolean): string;

/**
 * @param val The value to convert
 * @param long Wether or not the formatted date should be in long format
 * @returns Miliseconds equivelent to the time passed or a nicely formatted date for passed miliseconds.
 * @api public
 */
function ms(val: string | number, long?: boolean): string | number | null | never {
  long = long ?? false;

  if (typeof val === 'string' && val.length > 0) return parse(val);
  else if (typeof val === 'number' && !isNaN(val)) return (long ? fmtLong(val) : fmtShort(val));

  throw new TypeError(`Value is not a non-empty string or a valid number. Value=${JSON.stringify(val)}`);
}

export {
  ms
};
