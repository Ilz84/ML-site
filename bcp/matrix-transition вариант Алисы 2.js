(() => {
  const DURATION = 2800;
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン零壱弐参四五六七八九天地人金木水火土日月山川風龍侍忍夢電脳";
  let overlay, canvas, ctx, cols, rowIndices, jumpTimers, jumpPeriods, currentChars;

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
    // Важно: меняем размер холста, но НЕ сбрасываем состояние анимации
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 18;
    cols = Math.floor(canvas.width / fontSize);

    // Если это первый запуск — инициализируем массивы
    if (!rowIndices) {
      rowIndices = Array(cols).fill(0);
      currentChars = Array.from({ length: cols }, () => chars[Math.floor(Math.random() * chars.length)]);
      jumpPeriods = Array.from({ length: cols }, () => 200 + Math.random() * 300); // 2–5 прыжков/сек
      jumpTimers = Array(cols).fill(0);
    } else {
      // При ресайзе просто подгоняем количество столбцов, если экран стал уже/шире
      if (rowIndices.length !== cols) {
        const oldLen = rowIndices.length;
        rowIndices.length = cols;
        currentChars.length = cols;
        jumpPeriods.length = cols;
        jumpTimers.length = cols;

        // Заполняем новые столбцы случайными значениями
        for (let i = oldLen; i < cols; i++) {
          rowIndices[i] = 0;
          currentChars[i] = chars[Math.floor(Math.random() * chars.length)];
          jumpPeriods[i] = 200 + Math.random() * 300;
          jumpTimers[i] = 0;
        }
      }
    }

    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
  }

  function draw() {
    // Лёгкий полупрозрачный фон, чтобы оставался едва заметный шлейф
    ctx.fillStyle = "rgba(2, 8, 4, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();

    for (let i = 0; i < cols; i++) {
      const x = i * 18;

      // Если пора прыгать — делаем прыжок и меняем символ
      if (now - jumpTimers[i] >= jumpPeriods[i]) {
        jumpTimers[i] = now;
        rowIndices[i]++; // шаг ровно на одну строку (18 px)
        currentChars[i] = chars[Math.floor(Math.random() * chars.length)]; // новый символ только при прыжке
      }

      const y = rowIndices[i] * 18; // y всегда кратно 18

      // Голова — яркий читаемый символ
      ctx.fillStyle = "#c8ffdb";
      ctx.fillText(currentChars[i], x, y);

      // Хвост — тот же символ, чтобы не мельтешил
      ctx.fillStyle = "#1dff7f";
      ctx.fillText(currentChars[i], x, y - 18);

      // Сброс столбца, если ушёл за экран (с небольшой вероятностью, чтобы не было синхронного сброса)
      if (y > canvas.height && Math.random() > 0.975) {
        rowIndices[i] = 0;
        // При сбросе можно оставить тот же символ или дать новый — тут оставляем тот же
      }
    }

    requestAnimationFrame(draw);
  }

  function startTransition(url) {
    ensureOverlay();
    // Убеждаемся, что canvas и ctx инициализированы
    if (!canvas || !ctx) {
      canvas = overlay.querySelector("canvas");
      ctx = canvas.getContext("2d");
      resize();
    }

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    draw();

    setTimeout(() => {
      cancelAnimationFrame(draw); // на самом деле draw не хранит ID, поэтому просто перестаём вызывать
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
