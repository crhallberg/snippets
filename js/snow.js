/**
 * Add snow background to data-snow elements
 *
 * - Float elements and children need higher z-indexes
 */
(function initializeSnow() {
  const els = document.querySelectorAll("[data-snow]");
  if (els.length === 0) {
    return;
  }

  const getWind = (function windContainer() {
    var mouseX;
    document.addEventListener(
      "mousemove",
      function updateMouseX(e) {
        mouseX = e.clientX;
      },
      { passive: true }
    );
    return function getWind(a) {
      if (typeof mouseX === "undefined") {
        return 0;
      }
      const x = Math.min(Math.max(mouseX - a.offsetLeft, 0), a.width);
      return (x / a.width) * 2 - 1;
    };
  })();

  function drawSnow(a, c, flakes) {
    c.clearRect(0, 0, a.width, a.height);
    c.fillStyle = "rgba(255,255,255,.3)";
    c.strokeStyle = "rgba(255,255,255,.4)";
    c.lineWidth = 2;
    const wind = getWind(a) * 10;
    for (let i = 0; i < flakes.length; i++) {
      c.save();
      c.beginPath();
      if (i < flakes.length / 2) {
        // one half are circle blobs
        c.arc(
          flakes[i].x,
          flakes[i].y,
          (2 * flakes[i].size) / 3,
          0,
          2 * Math.PI
        );
        c.fill();
      } else {
        // asterisk shapes
        c.translate(flakes[i].x, flakes[i].y);
        c.rotate(flakes[i].angle);
        for (let j = 0; j < 6; j++) {
          c.moveTo(0, 0);
          c.lineTo(0, flakes[i].size);
          // Detailed tongs
          let q = flakes[i].size / 3;
          if (q > 3) {
            c.moveTo(0, flakes[i].size - q);
            c.lineTo(q, flakes[i].size - q / 2);
            c.moveTo(0, flakes[i].size - q);
            c.lineTo(-q, flakes[i].size - q / 2);
          }
          c.rotate(Math.PI / 3);
        }
        c.stroke();
      }
      c.closePath();
      c.restore();
      flakes[i].x += flakes[i].drift + wind;
      flakes[i].y += flakes[i].fall;
      flakes[i].drift += (Math.random() - 0.5) / 2;
      flakes[i].drift *= 0.98;
      flakes[i].angle += flakes[i].spin;
      if (flakes[i].x < 20) {
        flakes[i].x += a.width + 40;
      }
      if (flakes[i].x > a.width + 20) {
        flakes[i].x -= a.width + 40;
      }
      if (flakes[i].y > a.height + 100) {
        flakes[i].x = Math.random() * a.width;
        flakes[i].y -= a.height + 200;
      }
    }
    setTimeout(_ => drawSnow(a, c, flakes), 18);
  }

  const elArr = [].slice.apply(els);
  for (let i = 0; i < elArr.length; i++) {
    const e = elArr[i];
    const a = document.createElement("canvas");
    a.width = e.offsetWidth;
    a.height = e.offsetHeight;
    const c = a.getContext("2d");
    e.appendChild(a);
    drawSnow(
      a,
      c,
      new Array(100).fill(0).map(_ => ({
        x: Math.random() * a.width,
        y: Math.random() * (a.height + 200) - 100,
        size: Math.random() * 7 + 5,
        angle: Math.random() * Math.PI * 2,
        drift: Math.random() * 2 - 1,
        fall: Math.random() * 3 + 1,
        spin: Math.random() / 20
      }))
    );
  }
})();
