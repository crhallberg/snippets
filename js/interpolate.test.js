const assert = require("assert");
const { interpolate, interpolateDate } = require("../js/interpolate");

const MAP = {
  a: (src) => 1,
  b: (src) => "two",
  c: (src) => new Date("March 3").getDate(),
  d: (src) => src,
};
// Normal
assert.equal(interpolate("{a} {b} {c} {d}", MAP)(4), "1 two 3 4");

// Different RGX
assert.equal(interpolate("@a@ @b@ @c@ @d@", MAP, /@(\w+)@/g)(4), "1 two 3 4");

// Wrong RGX
assert.throws(() => interpolate("@a@ @b@ @c@ @d@", MAP, /@\w+@/g), {
  name: "Error",
  message: "interpolate: regular expression needs one group to match keys.",
});

// Missing
assert.equal(interpolate("{a} {b} {c} {x}", MAP)(4), "1 two 3 ");

// No map, no break
assert.equal(interpolate("{a} {b} {c} {d}")(4), "   ");

// Function map
assert.equal(interpolate("{a}", (src, key) => key + "!")(4), "a!");

// Dives
const diveTest = interpolate("Hello, {.name}! Happy {.life.age}th Birthday!");
assert.equal(
  diveTest({ name: "Chris", life: { age: 32 } }),
  "Hello, Chris! Happy 32th Birthday!"
);

// Dive and fill
assert.equal(
  interpolate("{!.type}", { bacon: (src) => "yum" })({ type: "bacon" }),
  "yum"
);

// Dates
const jan1 = new Date(2021, 0, 1, 13, 14, 15, 161);
assert.equal(interpolateDate("{YYYY}-{MM}-{dd}T{HH}")(jan1), "2021-01-01T13");
assert.equal(interpolateDate("{MMM} {d}, {YY}")(jan1), "Jan 1, 21");
assert.equal(interpolateDate("{ss}.{SSS}")(jan1), "15.161");
assert.equal(interpolateDate("{h}:{mm}:{ss} {a}")(jan1), "1:14:15 p.m.");
