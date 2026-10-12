// The "models put the layers together" slide: a GLEAM-style global metapopulation epidemic on the
// real airline network (js/flights-data.js: the 400 busiest airports, 2,160 strongest links).
//
// Every airport is a population running its own SIR outbreak, size proportional to its traffic.
// Travellers leave along links at a rate set by the link's weight; one leaving an infected airport
// carries the infection with probability equal to its prevalence and glows as it flies the
// great-circle arc. An infected traveller landing in an untouched airport seeds its outbreak.
// Airports glow with prevalence and dim when recovered. Each loop starts from a different hub.
// Drawn on a canvas in the deck's light theme (Ankit preferred it to a dark slide).
(function () {
  const SEEDS = ['Sao Paulo', 'London', 'Johannesburg', 'Mexico City', 'Singapore'];
  function start(container, user) {
    const opt = Object.assign({ tick: 90, beta: 0.55, gamma: 0.16, rate: 0.0045, fly: 1500, pause: 3000 }, user || {});
    const F = window.FLIGHTS, N = F.P.length, W = 1280, H = 700;
    const cv = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = '100%'; cv.style.height = '100%'; cv.style.display = 'block';
    cv.style.objectFit = 'contain';
    container.innerHTML = ''; container.appendChild(cv);
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    // ---- the static base: ocean, land, every link faint, every airport a point
    const base = document.createElement('canvas'); base.width = W * dpr; base.height = H * dpr;
    const b = base.getContext('2d'); b.scale(dpr, dpr);
    // light theme, to match the deck: no ocean fill (the slide's own white), the deck's land grey,
    // faint blue routes
    b.fillStyle = '#e1e6ec'; b.fill(new Path2D(F.land));
    b.strokeStyle = 'rgba(44,127,184,0.085)'; b.lineWidth = 0.8;
    F.arc.forEach(a => { b.beginPath(); b.moveTo(a[0], a[1]); for (let k = 2; k < a.length; k += 2) b.lineTo(a[k], a[k + 1]); b.stroke(); });
    const rad = F.deg.map(d => 1 + Math.sqrt(d) / 9);
    b.fillStyle = 'rgba(37,52,148,0.32)';
    F.P.forEach((p, i) => { b.beginPath(); b.arc(p[0], p[1], rad[i] * 0.6, 0, 7); b.fill(); });

    const nb = Array.from({ length: N }, () => []);
    F.E.forEach(([i, j, w], e) => { nb[i].push([j, w, e, false]); nb[j].push([i, w, e, true]); });
    let S, I, R, fl, reached, day, loop = 0, timer = null, raf = null, over = false;
    function reset() {
      S = new Float64Array(N).fill(1); I = new Float64Array(N); R = new Float64Array(N); fl = []; day = 0; over = false;
      const name = SEEDS[loop++ % SEEDS.length]; let s = F.city.indexOf(name); if (s < 0) s = 0;
      I[s] = 0.01; S[s] = 0.99; reached = new Set([s]);
    }
    function step() {
      if (over) return; day++;
      for (let i = 0; i < N; i++) {
        if (I[i] <= 0) continue;
        const inf = opt.beta * S[i] * I[i], rec = opt.gamma * I[i];
        S[i] -= inf; I[i] += inf - rec; R[i] += rec;
        if (I[i] < 2e-4) { R[i] += I[i]; I[i] = 0; continue; }
        for (const [j, w, e, rev] of nb[i]) {               // infected travellers leave along each link
          if (reached.has(j)) continue;
          if (Math.random() < opt.rate * Math.sqrt(w) * I[i] * 40) fl.push({ i, j, e, rev, t0: performance.now() });
        }
      }
      if (![...I].some(v => v > 0) && fl.length === 0) { over = true; setTimeout(reset, opt.pause); }
    }
    const at = (a, f, rev) => { const m = (a.length / 2 - 1), u = (rev ? 1 - f : f) * m, k = Math.min(m - 1, Math.floor(u)), r = u - k;
      return [a[2 * k] + (a[2 * k + 2] - a[2 * k]) * r, a[2 * k + 1] + (a[2 * k + 3] - a[2 * k + 1]) * r]; };
    function frame(t) {
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H); ctx.drawImage(base, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';   // additive glow only works on dark; plain alpha on light
      // links with someone in flight glow, and each traveller is a bright head with a short tail
      fl = fl.filter(v => {
        const f = (t - v.t0) / opt.fly, a = F.arc[v.e];
        if (f >= 1) { if (!reached.has(v.j)) { reached.add(v.j); I[v.j] = 0.004; S[v.j] -= 0.004; } return false; }
        ctx.strokeStyle = 'rgba(232,89,12,0.22)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
        for (let k = 2; k < a.length; k += 2) ctx.lineTo(a[k], a[k + 1]); ctx.stroke();
        for (let s = 0; s < 6; s++) { const p = at(a, Math.max(0, f - s * 0.025), v.rev);
          ctx.fillStyle = `rgba(232,89,12,${0.95 - s * 0.15})`; ctx.beginPath(); ctx.arc(p[0], p[1], 2.6 - s * 0.3, 0, 7); ctx.fill(); }
        return true;
      });
      // airports glow with prevalence, and settle to a dim ember when recovered
      for (let i = 0; i < N; i++) {
        const p = F.P[i];
        if (I[i] > 0) { const g = Math.min(1, I[i] / 0.18), r = rad[i] * (2.2 + 4 * g);
          const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
          gr.addColorStop(0, `rgba(232,89,12,${0.55 + 0.4 * g})`); gr.addColorStop(0.45, `rgba(232,89,12,${0.28 * g + 0.1})`); gr.addColorStop(1, 'rgba(232,89,12,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); }
        else if (R[i] > 0.05) { ctx.fillStyle = 'rgba(140,140,140,0.55)'; ctx.beginPath(); ctx.arc(p[0], p[1], rad[i] * 0.8, 0, 7); ctx.fill(); }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#222'; ctx.font = '700 26px "PT Sans", Helvetica, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(`day ${day}`, W - 34, 52);
      ctx.font = '20px "PT Sans", Helvetica, sans-serif'; ctx.fillStyle = '#666';
      ctx.fillText(`${reached.size} of ${N} cities reached`, W - 34, 80);
      raf = requestAnimationFrame(frame);
    }
    reset();
    return { play() { if (!timer) timer = setInterval(step, opt.tick); if (!raf) raf = requestAnimationFrame(frame); },
             pause() { clearInterval(timer); timer = null; cancelAnimationFrame(raf); raf = null; } };
  }
  window.startGleam = start;
})();
