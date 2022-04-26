export function createStore(fn) {
  let state = resolve(fn, set);
  let subs = [];
  let isUpdating = false;

  function resolve(value, pass) {
    return value instanceof Function
      ? value(pass)
      : value instanceof Object
      ? value
      : { value };
  }

  function set(value) {
    Object.assign(state, resolve(value, state));

    if (!isUpdating) {
      isUpdating = true;

      subs.forEach((fn) => fn(state, () => unsubscribe(fn)));

      isUpdating = false;
    }

    return state;
  }

  function subscribe(fn, fireImmediately = false) {
    subs.push(fn);

    if (fireImmediately) {
      fn(state);
    }

    return () => unsubscribe(fn);
  }

  function unsubscribe(fn) {
    return subs.splice(subs.indexOf(fn), 1);
  }

  return { ...state, set, subscribe, unsubscribe, get: () => state };
}

export function createDerived(store, transform) {
  const derived = createStore(() => store);

  store.subscribe((state, unsub) => derived.set(transform(state, unsub)), true);

  return {
    ...derived,
    set: (op) => store.set(op),
  };
}

export function createLocalStore(name, fn, storage = localStorage) {
  const store = createStore(fn);

  store.subscribe((state) => {
    storage.setItem(name, JSON.stringify(state));
  });

  const local = storage.getItem(name);

  store.set(local !== null ? JSON.parse(local) : {});

  return {
    ...store,
    clearStorage: () => {
      storage.removeItem(name);
    },
  };
}

export function createUndoable(fn) {
  let store = createStore(fn);
  let history = [];
  let current = -1;
  let isStepping = false;

  function get() {
    return history[current];
  }

  function undo() {
    if (current > 0) {
      isStepping = true;
      store.set(history[--current]);
    }
  }

  function redo() {
    if (current < history.length - 1) {
      isStepping = true;
      store.set(history[++current]);
    }
  }

  store.subscribe((state) => {
    if (!isStepping) {
      history[++current] = Object.assign({}, state);
    }

    isStepping = false;
  }, true);

  return { ...store, get, undo, redo };
}
