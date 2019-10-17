/**
 *  <div class="blob" data-template="blob-template">
 *    <div class="blob-body">
 *      <button class="blob-header" data-slot="header">Default Header</button>
 *      <p data-slot="description">Default Description</p>
 *    </div>
 *    <footer class="blob-footer" data-slot="footer">Default Footer</footer>
 *  </div>
 */

// === No render ===

const Template = (function TemplateEngine() {
  let templates = {};
  document
    .querySelectorAll("[data-template]")
    .forEach(function templateInit(t) {
      let slots = {};
      const el = t.cloneNode(true);
      el.querySelectorAll("[data-slot]").forEach(function(el) {
        const slot = el.dataset.slot;
        if (typeof slots[slot] === "undefined") {
          slots[slot] = [];
        }
        slots[slot].push({ el, default: el.innerHTML });
      });
      templates[el.dataset.template] = { el, slots };
      el.removeAttribute("data-template");
    });

  return function getTemplate(id, _slots = {}) {
    if (typeof templates[id] === "undefined") {
      throw ReferenceError("Undefined Template: " + id);
    }
    const template = templates[id];
    for (let key in template.slots) {
      const content = _slots[key] || template.slots[key].default;
      for (let { el } of template.slots[key]) {
        if (el instanceof HTMLInputElement) {
          el.value = content;
        } else if (content instanceof HTMLElement) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
          el.appendChild(content);
        } else {
          el.innerHTML = content;
        }
      }
    }
    return template.el.cloneNode(true);
  };
})();
