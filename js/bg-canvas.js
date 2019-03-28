function attachBGCanvas(el) {
  let a = el.querySelector(".js-bg-canvas");
  if (!a) {
    a = document.createElement("canvas");
    a.className = "js-bg-canvas";
    a.width = el.offsetWidth;
    a.height = el.offsetHeight;
    el.appendChild(a);
  }
  return a;
}
