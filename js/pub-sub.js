function pubsub(_el) {
  const el = _el || document;

  function emit(name) {
    var parameters = Array.from(arguments).slice(1); // capture additional arguments
    if (parameters.length === 0) {
      el.dispatchEvent(new Event(name));
    } else {
      var event = document.createEvent("CustomEvent");
      // CustomEvent: name, canBubble, cancelable, detail
      event.initCustomEvent(name, true, true, parameters);
      el.dispatchEvent(event);
    }
    return el;
  }

  // Listen shortcut to put everyone on the same element
  function listen(name, func) {
    el.addEventListener(
      name,
      function listenPass(e) {
        func.apply(null, e.detail);
      },
      false
    );
    return el;
  }

  function unlisten(name, func) {
    el.removeEventListener(name, func);
    return el;
  }

  return { emit, listen, unlisten };
}
