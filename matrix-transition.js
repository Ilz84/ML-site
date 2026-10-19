(() => {
  const DURATION = 2800; // 2.8 сек
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン零壱弐参四五六七八九天地人金木水火土日月山川風龍侍忍夢電脳";
  let overlay, canvas, ctx, cols, drops, animationId;

  function ensureOverlay() {
    if (document.getElementById("matrix-transition")) return;
    overlay = document.createElement("div");
    overlay.id = "matrix-transition";
    overlay.innerHTML = `
      <canvas></canvas>
      <div class="loading-label">matrix jump in progress...</div>
    `;
    document.body.appendChild(overlay);
    canvas = overlay.querySelector("canvas");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 18;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array(cols).fill(1);
    ctx.font = `${fontSize}px monospace`;
  }

  function draw() {
    ctx.fillStyle = "rgba(2, 8, 4, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 18;
      const y = drops[i] * 18;

      // яркая "голова"
      ctx.fillStyle = "#c8ffdb";
      ctx.fillText(text, x, y);

      // хвост
      ctx.fillStyle = "#1dff7f";
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 18);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }

    animationId = requestAnimationFrame(draw);
  }

  function startTransition(url) {
    ensureOverlay();
    overlay = document.getElementById("matrix-transition");
    canvas = overlay.querySelector("canvas");
    ctx = canvas.getContext("2d");
    resize();

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    draw();

    setTimeout(() => {
      cancelAnimationFrame(animationId);
      window.location.href = url;
    }, DURATION);
  }

  function bindLinks() {
    const links = document.querySelectorAll("a[data-transition='matrix']");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("http") || href.startsWith("#")) return;
        e.preventDefault();
        startTransition(href);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", bindLinks);
})();