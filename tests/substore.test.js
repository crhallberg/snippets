const assert = require("assert");
const { createStore, createDerived, createLocalStore } = require("../js/substore");

const { users } = require("./test-user-store.js");

let calls = [];

// createStore
let counter = createStore(0);
assert.equal(counter.get(), 0);

counter.set(1);
assert.equal(counter.get(), 1);

counter.subscribe((data) => {
    calls.push("sub " + data);
    return 7;
});
assert.equal(counter.get(), 1); // no sub side effect
assert.equal(calls.length, 1); // immediate sub call

counter.set(2);
assert.equal(counter.get(), 2);
assert.equal(calls.length, 2);

const unsub = counter.listen((data) => calls.push("listen " + data));
assert.equal(calls.length, 2); // no immediate listen call

counter.update((data) => {
    assert.equal(data, 2);
    return data * 2;
});
assert.equal(counter.get(), 4);
assert.equal(calls.length, 4);

unsub();
counter.set(5);
assert.equal(calls.length, 5);

// Cross file test
const admins = createDerived(users, (users) => {
    // TODO: Side effect issues
    // users.push("oh no");
    return users.filter((user) => user.isAdmin);
});
assert.equal(users.get().length, 2);
assert.equal(admins.get().length, 1);
assert.equal(admins.get()[0].name, "Admin");
users.update((users) => {
    users.push({ name: "Superuser", isAdmin: true });
    return users;
});
assert.equal(users.get().length, 3);
assert.equal(admins.get().length, 2);
assert.equal(admins.get()[0].name, "Admin");
assert.equal(admins.get()[1].name, "Superuser");

// createDerived
const testDate = new Date("2021-08-08T10:00:00");
const session = createStore(testDate);
const formattedDate = createDerived(session, (date) => {
    const pad = (op) => "00".slice(String(op).length) + op;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`;
});
assert.equal(formattedDate.get(), "2021-08-08");
assert.equal(session.get(), testDate);

session.update((date) => {
    date.setDate(date.getDate() + 1);
    return date;
});
assert.equal(formattedDate.get(), "2021-08-09");

session.set(new Date("2000-01-01T10:00:00"));
assert.equal(formattedDate.get(), "2000-01-01");

// localStorage (browser only)
if (typeof localStorage != "undefined") {
    let local = createLocalStore("score", 10);
    let local2 = createLocalStore("score");
    assert.equal(local2.get(), 10);
}

// shouldNotify
const sellBitcoin = createStore(0, (prev, curr) => curr > 10);
sellBitcoin.listen((price) => calls.push(price + "?! SELL!"));
sellBitcoin.set(20);
sellBitcoin.set(5);

// initial shouldNotify
const buyBitcoin = createStore(0, (prev, curr) => curr < 10);
buyBitcoin.subscribe((price) => calls.push(price + "?! BUY!"));
buyBitcoin.set(20);
buyBitcoin.set(5);

// Call checks
assert.equal(
    JSON.stringify(calls),
    '["sub 1","sub 2","sub 4","listen 4","sub 5","20?! SELL!","0?! BUY!","5?! BUY!"]',
);
