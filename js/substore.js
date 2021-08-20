function createStore(data = null, shouldNotify = () => true) {
    let subs = [];

    function notify(prevData, newData) {
        if (shouldNotify(prevData, newData)) {
            subs.forEach((fn) => fn(newData));
        }
        return newData;
    }

    function unsub() {
        let index = subs.length - 1;
        return function () {
            subs.splice(index, 1);
        };
    }

    return {
        get: () => data,
        set: (newData) => {
            return (data = notify(data, newData));
        },
        update: (fn) => {
            let newData = fn(data);
            return (data = notify(data, newData));
        },
        listen: (fn) => {
            subs.push(fn);
            return unsub();
        },
        subscribe: (fn) => {
            subs.push(fn);
            if (shouldNotify(null, data)) {
               fn(data);
            }
            return unsub();
        },
    };
}

function createDerived(store, transform, shouldNotify = () => true) {
    const derived = createStore(transform(store.get()), shouldNotify);
    store.listen((op) => derived.set(transform(op)));
    return derived;
}

function createLocalStore(key, initial = null, shouldNotify = () => true) {
    const store = createStore(initial, shouldNotify);
    if (localStorage[key]) {
        store.set(JSON.parse(localStorage[key]));
    }
    store.listen((data) => (localStorage[key] = JSON.stringify(data)));
    return store;
}

module.exports = { createStore, createDerived, createLocalStore };
