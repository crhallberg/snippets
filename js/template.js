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
    .forEach(function templateInit(el) {
      let slots = {};
      el.querySelectorAll("[data-slot]").forEach(function(el) {
        const slot = el.dataset.slot;
        if (typeof slots[slot] === "undefined") {
          slots[slot] = [];
        }
        slots[slot].push({ el, default: el.innerHTML });
      });
      templates[el.dataset.template] = { el, slots };
    });

  return function getTemplate(id, _slots = {}) {
    if (typeof templates[id] === "undefined") {
      throw ReferenceError("Undefined Template: " + id);
    }
    const template = templates[id];
    for (let key in template.slots) {
      for (let slot of template.slots[key]) {
        const content = _slots[key] || slot.default;
        if (content instanceof HTMLElement) {
          while (slot.el.hasChildNodes()) {
            slot.el.removeChild(slot.el.lastChild);
          }
          slot.el.appendChild(content);
        } else if (content instanceof Object && !Array.isArray(content)) {
          for (let attr in content) {
            if (attr in slot.el) {
              slot.el[attr] = content[attr];
            } else {
              console.error("Slot element has not attribute '" + attr + "'");
            }
          }
        } else if (slot.el instanceof HTMLInputElement) {
          slot.el.value = content;
        } else {
          slot.el.innerHTML = Array.isArray(content)
            ? content.join(" ")
            : content;
        }
      }
    }
    const el = template.el.cloneNode(true);
    el.removeAttribute("data-template");
    return el;
  };
})();
