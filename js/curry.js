function ary(fn, len = 1) {
  return (...args) => fn(...args.slice(0, len));
}

function curry(fn, len = 1) {
  function getMissing(args) {
    const missing = args.map((a, i) => typeof a == "undefined");

    if (missing.filter(Boolean).length === 0) {
      return fn(...args);
    }

    return (...next) => {
      let n = 0;
      const newArgs = missing.map((m, i) => (m ? next[n++] ?? args[i] : args[i]));
      return getMissing(newArgs);
    };
  }

  return getMissing(new Array(len).fill(undefined));
}

const c = curry(console.log.bind(console), 3);
c(1)(2)(3);
c(_, 2)(1, 3);

const d = c(_, 2);
const e = d(_, 3);
e(1);
e(4);

console.log(["1", "4", "6"].map(parseInt));
console.log(["1", "4", "6"].map(ary(parseInt, 1)));
