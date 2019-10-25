/**
 * REQUEST: (op, next) => { return next(op + 1); } // FIFO
 * RESPONSE: (op, next) => { let ret = next(op); return ret + 1; } // FILO
 */
function runPipe(op, funcs) {
  let queue = funcs.slice();

  function call(op) {
    if (queue.length === 0) {
      return op;
    }
    const nfunc = queue.shift();
    if (typeof nfunc === "function") {
      return nfunc(op, call);
    } else {
      return nfunc.pipe(
        op,
        call
      );
    }
  }

  return call(op);
}
