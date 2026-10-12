// The compartmental-model slide: an SIR model shown as three boxes of people.
//
// 40 faces start in Susceptible, one in Infected. Each step, every susceptible person is
// infected with probability 1 - exp(-beta * I / N) (everyone meets everyone: well mixed), and
// every infected person recovers with probability gamma. A person who changes compartment
// glides into a free seat in the next box; an infection lands with the same swell as slide 1.
// Underneath, the S, I and R counts draw the classic epidemic curves as the run unfolds. Loops.
// Options rows / by / label shrink it to a compact inset (the GLEAM slide's 'inside every city'):
// a viewBox height that ends below the boxes leaves the curves outside it, so they are clipped.
(function () {
  const AGES = ['young', 'middle', 'older'];
  function start(container, user) {
    const opt = Object.assign({ N: 40, beta: 0.62, gamma: 0.2, tick: 650, glide: 520, pause: 2600,
      W: 1150, H: 520, size: 40, cols: 8, rows: 5, by: 46, label: 26, names: null, generic: false }, user || {});
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${opt.W} ${opt.H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (parent || svg).appendChild(e); return e; };
    const BOX = [{ key: 'S', name: 'Susceptible', col: '#2c7fb8', x: 20 }, { key: 'I', name: 'Infected', col: '#e8590c', x: 405 },
                 { key: 'R', name: 'Recovered', col: '#8a8a8a', x: 790 }];
    const BW = 340, BY = opt.by, BH = opt.rows * (opt.size + 4) + 22, cell = BW / opt.cols;
    const counts = {};
    BOX.forEach(b => {
      el('rect', { x: b.x, y: BY, width: BW, height: BH, rx: 14, fill: '#fafbfc', stroke: b.col, 'stroke-width': 2.5 });
      const t = el('text', { x: b.x + 2, y: BY - 16, 'font-size': opt.label, 'font-weight': 700, fill: b.col, 'font-family': 'PT Sans, Helvetica, sans-serif' }); t.textContent = opt.names ? opt.names[BOX.indexOf(b)] : b.name;
      counts[b.key] = el('text', { x: b.x + BW - 2, y: BY - 16, 'font-size': opt.label, 'font-weight': 700, fill: b.col, 'text-anchor': 'end', 'font-family': 'PT Sans, Helvetica, sans-serif' });
    });
    // the epidemic curves
    const CX = 20, CW = 1110, CY0 = BY + BH + 30, CH = 150, T = 30;
    el('line', { x1: CX, y1: CY0 + CH, x2: CX + CW, y2: CY0 + CH, stroke: '#d0d0d0', 'stroke-width': 1.5 });
    const ax = el('text', { x: CX + CW, y: CY0 + CH + 22, 'font-size': 19, fill: '#888', 'text-anchor': 'end', 'font-family': 'PT Sans, Helvetica, sans-serif' }); ax.textContent = 'time';
    const curve = {}; BOX.forEach(b => { curve[b.key] = el('polyline', { fill: 'none', stroke: b.col, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }); });
    const gF = el('g', {});
    container.innerHTML = ''; container.appendChild(svg);

    const people = Array.from({ length: opt.N }, (_, i) => ({ age: AGES[i % 3], style: (i >> 1) % 2, skin: (i * 7) % 4 }));
    const cache = {}, img = (p, st) => { const k = p.age + p.style + p.skin + st;
      return cache[k] || (cache[k] = 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar({ age: p.age, style: p.style, skin: p.skin, state: st, generic: opt.generic }))); };
    const ims = people.map(() => el('image', { width: opt.size, height: opt.size }, gF));
    const seatXY = (b, s) => [BOX[b].x + (s % opt.cols) * cell + (cell - opt.size) / 2, BY + 11 + Math.floor(s / opt.cols) * (opt.size + 4)];
    let st, seat, box, hist, timer = null, raf = null, moves = new Map(), pops = new Map(), over = false;
    const free = b => { const used = new Set(people.map((_, i) => box[i] === b ? seat[i] : -1)); let s = 0; while (used.has(s)) s++; return s; };
    function compactS(vacated) {
      let last = -1, who = -1;
      people.forEach((_, k) => { if (box[k] === 0 && seat[k] > last) { last = seat[k]; who = k; } });
      if (who < 0 || last <= vacated) return;
      const [x, y] = seatXY(0, vacated), from = [+ims[who].getAttribute('x'), +ims[who].getAttribute('y')];
      seat[who] = vacated; moves.set(who, { from, to: [x, y], t0: performance.now() });
    }
    function place(i, b, animate) {
      const leftS = box[i] === 0 ? seat[i] : -1;
      const s = free(b), [x, y] = seatXY(b, s), from = [+ims[i].getAttribute('x') || x, +ims[i].getAttribute('y') || y];
      box[i] = b; seat[i] = s;
      if (animate) moves.set(i, { from, to: [x, y], t0: performance.now() });
      else { ims[i].setAttribute('x', x); ims[i].setAttribute('y', y); }
    }
    function draw() {
      const n = { S: 0, I: 0, R: 0 }; st.forEach(s => n[s]++);
      BOX.forEach(b => { counts[b.key].textContent = n[b.key]; });
      hist.push(n);
      BOX.forEach(b => curve[b.key].setAttribute('points', hist.map((h, k) =>
        `${CX + (k / T) * CW},${CY0 + CH - (h[b.key] / opt.N) * CH}`).join(' ')));
    }
    function reset() {
      st = people.map(() => 'S'); seat = people.map(() => -1); box = people.map(() => -1); hist = []; over = false;
      people.forEach((p, i) => { ims[i].setAttribute('href', img(p, 'S')); place(i, 0, false); });
      // three first cases: with one, about a third of outbreaks (1/R0) die out at once and the slide sits still
      const order = people.map((_, i) => i).sort((a, b) => seat[b] - seat[a]).slice(0, 3);
      order.forEach(s => { st[s] = 'I'; ims[s].setAttribute('href', img(people[s], 'I')); place(s, 1, false); });
      draw();
    }
    function step() {
      if (over) return;
      // Everyone in a compartment is interchangeable in this model (mass action, memoryless
      // recovery), so drawing the face in a box's LAST seat as the one that leaves changes
      // nothing statistically and keeps every box packed with nothing crossing anything.
      const I = st.filter(s => s === 'I').length, pInf = 1 - Math.exp(-opt.beta * I / opt.N), now = performance.now();
      const nS = st.filter(s => s === 'S').length, nI = I;
      let newI = 0, newR = 0;
      for (let k = 0; k < nS; k++) if (Math.random() < pInf) newI++;
      for (let k = 0; k < nI; k++) if (Math.random() < opt.gamma) newR++;
      const lastOf = b => people.map((_, i) => i).filter(i => box[i] === b).sort((a, c) => seat[c] - seat[a]);
      lastOf(1).slice(0, newR).forEach(i => { st[i] = 'R'; ims[i].setAttribute('href', img(people[i], 'R')); place(i, 2, true); });
      lastOf(0).slice(0, newI).forEach(i => { st[i] = 'I'; ims[i].setAttribute('href', img(people[i], 'I')); place(i, 1, true); pops.set(i, now + opt.glide); });
      draw();
      if (!st.includes('I') || hist.length > T) { over = true; setTimeout(reset, opt.pause); }
    }
    function frame(t) {
      moves.forEach((m, i) => { const u = Math.min(1, (t - m.t0) / opt.glide), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        ims[i].setAttribute('x', m.from[0] + (m.to[0] - m.from[0]) * e); ims[i].setAttribute('y', m.from[1] + (m.to[1] - m.from[1]) * e);
        if (u >= 1) moves.delete(i); });
      pops.forEach((t0, i) => { if (t < t0) return; const u = Math.min(1, (t - t0) / 420), s = 1 + 0.3 * Math.sin(Math.PI * u), z = opt.size * s;
        const [x, y] = seatXY(box[i], seat[i]); ims[i].setAttribute('x', x - (z - opt.size) / 2); ims[i].setAttribute('y', y - (z - opt.size) / 2);
        ims[i].setAttribute('width', z); ims[i].setAttribute('height', z); if (u >= 1) { pops.delete(i); ims[i].setAttribute('width', opt.size); ims[i].setAttribute('height', opt.size); } });
      raf = requestAnimationFrame(frame);
    }
    reset();
    return { play() { if (!timer) timer = setInterval(step, opt.tick); if (!raf) raf = requestAnimationFrame(frame); },
             pause() { clearInterval(timer); timer = null; cancelAnimationFrame(raf); raf = null; } };
  }
  window.startSIR = start;
})();
