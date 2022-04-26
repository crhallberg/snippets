function interpolate(pattern, map = {}, RGX = /\{([^\}]+)\}/g) {
  function dive(src, path) {
    return path
      .split(".")
      .slice(1)
      .reduce((ret, key) => ret[key] ?? null, src);
  }
  function fill(src, key) {
    switch (key[0]) {
      case ".":
        return dive(src, key);
      case "!":
        return fill(src, dive(src, key))
      default:
        if (typeof map == "function") {
          return map(src, key);
        }
        return map[key] ? map[key](src) ?? "" : ""
    }
  }
  const parts = pattern.split(RGX);
  if (parts[1].trim().length === 0) {
    throw new Error("interpolate: regular expression needs one group to match keys.");
  }
  return (src) =>
    parts.reduce((ret, part, i) => ret + (i % 2 ? fill(src, part) : part), "");
}

function pad(str, len = 2) {
  return "0000000000".slice(String(str).length, len - 10) + str;
}
const DATE_MAP = {
  YYYY: (src) => src.getFullYear(),
  YY: (src) => src.getFullYear() % 100,
  MMM: (src) => src.toDateString().split(" ")[1],
  MM: (src) => pad(src.getMonth() + 1),
  M: (src) => src.getMonth() + 1,
  dd: (src) => pad(src.getDate()),
  d: (src) => src.getDate(),
  HH: (src) => pad(src.getHours()),
  H: (src) => src.getHours(),
  hh: (src) => pad(src.getHours() % 12 || 12),
  h: (src) => src.getHours() % 12 || 12,
  mm: (src) => pad(src.getMinutes()),
  m: (src) => src.getMinutes(),
  ss: (src) => pad(src.getSeconds()),
  s: (src) => src.getSeconds(),
  SSS: (src) => pad(src.getMilliseconds(), 3),
  S: (src) => src.getMilliseconds(),
  a: (src) => pad(src.getHours() < 12 ? "a.m." : "p.m."),
};
function interpolateDate(format = "{YYYY}-{MM}-{dd}T{HH}:{mm}:{ss}Z") {
    return interpolate(format, DATE_MAP);
}

if (typeof module != "undefined") {
  module.exports = { interpolate, interpolateDate, DATE_MAP };
}
