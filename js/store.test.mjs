import { suite } from "uvu";
import * as assert from "uvu/assert";

import {
  createStore,
  createDerived,
  createLocalStore,
  createUndoable,
} from "./store.mjs";

const createStoreSuite = suite("createStore");

createStoreSuite.before.each((context) => {
  context.store = createStore((set) => ({
    count: 0,
    date: new Date(),
    string: new String("!"),
    bump: () => set((state) => ({ count: state.count + 1 })),
  }));
});

createStoreSuite("types", ({ store }) => {
  assert.type(store.count, "number");
  assert.type(store.bump, "function");

  assert.type(store.get, "function");
  assert.type(store.set, "function");
  assert.type(store.subscribe, "function");

  assert.ok(store.date instanceof Date);
  assert.ok(store.get().date instanceof Date);

  assert.ok(store.string instanceof String);
  assert.ok(store.get().string instanceof String);
});

createStoreSuite("subscribe", ({ store }) => {
  assert.is(store.get().count, 0, "init");

  let calls = 0;
  const unsub = store.subscribe((state, unsub) => {
    assert.type(unsub, "function", "unsub passed");

    calls += 1;
  });

  assert.is(store.get().count, 0);
  assert.is(calls, 0, "no immediate fire");

  store.bump();

  assert.is(store.get().count, 1, "bump change");
  assert.is(calls, 1, "bump sub");

  unsub();

  store.bump();

  assert.is(store.get().count, 2, "bump change");
  assert.is(calls, 1, "bump unsubbed");
});

createStoreSuite("fire immediately", ({ store }) => {
  let calls = 0;
  store.subscribe((state) => {
    assert.is(state.count, calls, "correct state passed");

    calls += 1;
  }, true);

  assert.is(store.get().count, 0, "immediate fire no change");
  assert.is(calls, 1, "immediate fire");

  store.bump();

  assert.is(store.get().count, 1, "bump change");
  assert.is(calls, 2, "bump sub");
});

createStoreSuite("atoms", () => {
    const store = createStore(0);

    store.subscribe(({ value }) => {
        assert.is(value, 1);
    });

    store.set(1);

    assert.is(store.get().value, 1);
});

createStoreSuite.run();

// ---

const createDerivedSuite = suite("createDerived");

createDerivedSuite.before.each((context) => {
  context.store = createStore((set) => ({
    count: 0,
    bump: () => set((state) => ({ count: state.count + 1 })),
  }));

  context.derived = createDerived(context.store, (state) => ({
    count: state.count * 2,
  }));
});

createDerivedSuite("types", ({ store, derived }) => {
  assert.type(store.count, "number");
  assert.type(store.bump, "function");

  assert.type(derived.count, "number");
  assert.type(derived.bump, "function");
});

createDerivedSuite("derive", ({ store, derived }) => {
  store.set({ count: 5 });

  assert.is(store.get().count, 5, "original set passed to derived");
  assert.is(derived.get().count, 10, "original set passed to derived");

  derived.set({ count: 10 });

  assert.is(store.get().count, 10, "derived set passed to original");
  assert.is(derived.get().count, 20, "derived set passed to original");

  store.bump();

  assert.is(store.get().count, 11, "original calls passed to derived");
  assert.is(derived.get().count, 22, "original calls passed to derived");

  derived.bump();

  assert.is(store.get().count, 12, "derived calls passed to original");
  assert.is(derived.get().count, 24, "derived calls passed to original");
});

createDerivedSuite.run();

// ---

const createUndoableSuite = suite("createUndoable");

createUndoableSuite.before.each((context) => {
  context.store = createUndoable((set) => ({
    count: 0,
    bump: () => set((state) => ({ count: state.count + 1 })),
  }));
});

createUndoableSuite("types", ({ store }) => {
  assert.type(store.count, "number");
  assert.type(store.bump, "function");

  assert.type(store.undo, "function");
});

createUndoableSuite("history", ({ store }) => {
  store.set({ count: 10 });
  store.bump();

  assert.is(store.get().count, 11, "still works");

  store.undo();
  assert.is(store.get().count, 10, "rewind");

  store.undo();
  assert.is(store.get().count, 0, "rewind again");

  store.undo();
  assert.is(store.get().count, 0, "can't rewind past initial");

  store.redo();
  assert.is(store.get().count, 10, "forward");

  store.set({ count: 20 });
  assert.is(store.get().count, 20, "rewrite history");

  store.redo();
  assert.is(store.get().count, 20, "can't fast forward too much");

  store.undo();
  assert.is(store.get().count, 10, "rewritten history");
});

createUndoableSuite.run();

// ---

const createLocalStoreSuite = suite("createLocalStore");

createLocalStoreSuite("storage", () => {
  const storage = (function mockStorage() {
    let map = {};

    return {
      getItem: (name) => {
        return map[name] ?? null;
      },
      setItem: (name, value) => {
        map[name] = value;
      },
      removeItem: (name) => {
        delete map[name];
      },
      getParsed: (name) => {
        return JSON.parse(map[name]);
      },
    };
  })();

  const store = createLocalStore("count", (set) => ({ count: 0 }), storage);

  assert.is(storage.getParsed("count").count, 0, "initialize");

  store.set({ count: 1 });

  assert.is(storage.getParsed("count").count, 1, "updated");

  const cached = createLocalStore(
    "count",
    (set) => ({
      count: 0,
    }),
    storage
  );

  assert.equal(cached.get(), storage.getParsed("count"), "draw from storage");

  store.clearStorage();

  assert.is(storage.getItem("count"), null, "cleared");
});

createLocalStoreSuite.run();
