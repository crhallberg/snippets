/**
 *  <div class="blob" data-template="blob-template">
 *    <div class="blob-body">
 *      <button class="blob-header" data-slot="header">Default Header</button>
 *      <p data-slot="description">Default Description</p>
 *    </div>
 *    <footer class="blob-footer" data-slot="footer">Default Footer</footer>
 *  </div>
 *
 *  const el = Template("blob", { header: "TITLE", footer: "Public Domain 1.0" });
 *  el.render({ description: "Forgot the description." });
 */

// === With render ===

const Template = (function TemplateEngine() {
  let templates = {};
  document
    .querySelectorAll("[data-template]")
    .forEach(function templateInit(_el) {
      const el = _el.parentNode.removeChild(_el);
      templates[el.dataset.template] = el;
      el.removeAttribute("data-template");
    });

  function _render(slots, data) {
    for (let key in slots) {
      for (let slot of slots[key]) {
        const content =
          typeof data[key] !== "undefined" ? data[key] : slot.default;
        if (data[key] instanceof HTMLElement) {
          while (slot.el.hasChildNodes()) {
            slot.el.removeChild(slot.el.lastChild);
          }
          slot.el.appendChild(data[key]);
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
  }

  return function getTemplate(id, data = {}) {
    if (typeof templates[id] === "undefined") {
      throw ReferenceError("Undefined Template: " + id);
    }

    let slots = {};
    const cloneEl = templates[id].cloneNode(true);
    cloneEl.querySelectorAll("[data-slot]").forEach(function(el) {
      if (typeof slots[el.dataset.slot] === "undefined") {
        slots[el.dataset.slot] = [];
      }
      slots[el.dataset.slot].push({
        el,
        default: el.innerHTML,
      });
    });

    cloneEl.render = function(data) {
      return _render(slots, data);
    };

    cloneEl.render(data);

    return cloneEl;
  };
})();
