/**
 *  <div class="blob" id="blob-template" data-template>
 *    <div class="blob-body">
 *      <button class="blob-header" data-slot="header">Default Header</button>
 *      <p data-slot="description">Default Description</p>
 *    </div>
 *    <footer class="blob-footer" data-slot="footer">Default Footer</footer>
 *  </div>
  */

// === No render ===

const Template = (function templateInit() {
  let templates = {};
  document.querySelectorAll("[data-template]").forEach(t => {
    const cloneEl = t.cloneNode(true);
    const id = cloneEl.dataset.template;
    templates[id] = { el: cloneEl, slots: {} };
    cloneEl.removeAttribute("data-template");
    cloneEl.querySelectorAll("[data-slot]").forEach(function(slot) {
      templates[id].slots[slot.dataset.slot] = {
        el: slot,
        default: slot.innerHTML,
      };
    });
  });

  return function getTemplate(id, _slots = {}) {
    if (typeof templates[id] === "undefined") {
      throw ReferenceError("Undefined template: " + id);
    }
    const template = templates[id];
    for (let key in template.slots) {
      const content = _slots[key] || template.slots[key].default;
      if (content.innerHTML) {
        while (template.slots[key].el.hasChildNodes()) {
          template.slots[key].el.removeChild(template.slots[key].el.lastChild);
        }
        template.slots[key].el.appendChild(content);
      } else {
        template.slots[key].el.innerHTML = content;
      }
    }
    return template.el.cloneNode(true);
  };
})();
