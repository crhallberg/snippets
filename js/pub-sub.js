function emit(name) {
  var parameters = Array.from(arguments).slice(1); // capture additional arguments
  if (parameters.length === 0) {
    document.dispatchEvent(new Event(name));
  } else {
    var event = document.createEvent("CustomEvent");
    // CustomEvent: name, canBubble, cancelable, detail
    event.initCustomEvent(name, true, true, parameters);
    document.dispatchEvent(event);
  }
}

// Listen shortcut to put everyone on the same element
function listen(name, func) {
  document.addEventListener(
    name,
    function listenPass(e) {
      func.apply(null, e.detail);
    },
    false
  );
}
