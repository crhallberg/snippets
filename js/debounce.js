// Debounce
// Prevent a flood of calls
// From: 1 2 3 -
//   To: - - - 3
function debounce(func, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    const context = this,
      args = arguments;
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, delay);
  };
}

// Throttle
// Prevent calls for a certain amount of time
// From: 1 2 3
//   To: 1 - -
function throttle(func, delay) {
  let timeout = null;
  return function() {
    if (timeout === null) {
      func.apply(this, arguments);
      timeout = setTimeout(function() {
        timeout = null;
      }, delay);
    }
  };
}

// Accumulate
// Save all calls within a certain time and debounce together
// From: 1 2 3 -
//   To: - - - [1,2,3]
function accumulate(after, limit) {
  let timeout,
    pool = [];
  return function(op) {
    clearTimeout(timeout);
    pool.push(op);
    timeout = setTimeout(function() {
      after(pool);
      pool = [];
    }, limit);
  };
}

// Pace
// Queue and space calls
// From: 1 2 3
//   To: 1 - - 2 - - 3 - -
function pace(func, interval) {
  let timeout = null;
  let queue = [];

  function call() {
    func.apply(...queue.shift());
    timeout = setTimeout(function() {
      if (queue.length > 0) {
        call();
      } else {
        timeout = null;
      }
    }, interval);
  }

  return function() {
    queue.push([this, arguments]);
    if (timeout === null) {
      call();
    }
  };
}
