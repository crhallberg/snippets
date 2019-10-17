/**
 *  <div class="blob" data-template="blob-template">
 *    <div class="blob-body">
 *      <button class="blob-header" data-slot="header">Default Header</button>
 *      <p data-slot="description">Default Description</p>
 *    </div>
 *    <footer class="blob-footer" data-slot="footer">Default Footer</footer>
 *  </div>
 */

// === With render ===

const Template = (function TemplateEngine() {
  let templates = {};
  document
    .querySelectorAll("[data-template]")
    .forEach(function templateInit(t) {
      const cloneEl = t.cloneNode(true);
      templates[cloneEl.dataset.template] = cloneEl;
      cloneEl.removeAttribute("data-template");
    });

  function _render(slots, data) {
    for (let key in data) {
      for (let { el } of slots[key]) {
        if (el instanceof HTMLInputElement) {
          el.value = data[key];
        } else if (data[key] instanceof HTMLElement) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
          el.appendChild(data[key]);
        } else {
          el.innerHTML = data[key];
        }
      }
    }
  }

  return function getTemplate(id, _slots = {}) {
    if (typeof templates[id] === "undefined") {
      throw ReferenceError("Undefined Template: " + id);
    }

    let slots = {};
    const cloneEl = templates[id].cloneNode(true);
    cloneEl.querySelectorAll("[data-slot]").forEach(function(slot) {
      if (typeof slots[slot.dataset.slot] === "undefined") {
        slots[slot.dataset.slot] = [];
      }
      slots[slot.dataset.slot].push({
        el: slot,
        default: slot.innerHTML,
      });
    });

    cloneEl.render = function(data) {
      return _render(slots, data);
    };

    cloneEl.render(_slots);

    return cloneEl;
  };
})();
