import { klona } from "klona";

export function bindUndo(store) {
    const base = klona(store.get());
    let undoStack = [];
    let isUndoing = false;

    store.listen((state) => {
        if (!isUndoing) {
            undoStack.push(klona(state));
        }
        isUndoing = false;
    });

    function undo() {
        isUndoing = true;
        let index = undoStack.length - 2;
        if (index < 0) {
            store.set(klona(base));
            undoStack = [];
            return false;
        } else {
            store.set(undoStack[index]);
            undoStack = undoStack.slice(0, -1);
            return true;
        }
    }

    return undo;
}
