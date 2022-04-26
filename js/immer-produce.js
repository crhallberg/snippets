function immer(obj, cb) {
    const mass = (cb) => (obj) => {
        let draft = JSON.parse(JSON.stringify(obj));
        cb(draft);
        Object.freeze(draft);
        return draft;
    };
    // Curry
    if (typeof obj === "function") {
        return mass(obj);
    }
    return mass(cb)(obj);
}

let a = { x: 7 };
let b = immer(a, (draft) => {
    draft.x = 10;
});

const addZ = immer((draft) => {
    draft.z = 2;
});
let c = addZ(a);
let d = addZ(b);

console.log(a);
console.log(b);
console.log(c);
console.log(d);
