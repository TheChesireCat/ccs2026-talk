// Slides 2 and 3: a "mixing pot" of 36 people (19 / 9 / 8 adults aged 18-49 / 50-64 / 65+, about the
// US adult mix), the same people on both slides (seeded start).
//
// mode 'mixed' (slide 2, "The simplest model assumes everyone meets everyone"): generic people, no age
// shown, drift around one box like particles of a gas; whenever two touch, a line flashes and infection
// can pass. That is mass action, the picture behind "well mixed". The S / I / R counts and curves track
// the outbreak.
// mode 'sorted' (slide 3, "People do not mix at random"): the same box, then the people turn over to
// show their age, the box splits into four settings (work, home, school, community center; see ZONES)
// and everyone glides into theirs; they keep drifting there, with an occasional visit to another. A 3x3 table tallies who meets whom from
// the meetings as they happen (shares of each person's meetings, recent meetings weighted more): flat
// while anyone meets anyone, structured by setting once people sort. On the click (step 1), the real result (js/notrandom-data.js):
// over-65s infected by the end of an epidemic, well mixed against the Epistorm-Mix contact matrix.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'];
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const BOX = { x0: 24, y0: 26, x1: 650, y1: 456 }, R = 20, SIZE = 40, TOUCH = 44;
  // slide 3's settings, each with a gap around it: who is where follows the survey settings (households
  // mix ages; school is young adults; work is working ages; the community center is mostly older adults)
  const ZONES = [{ x0: 24, y0: 52, x1: 340, y1: 246, name: 'work', icon: 'briefcase' }, { x0: 378, y0: 52, x1: 650, y1: 246, name: 'home', icon: 'house' },
                 { x0: 24, y0: 312, x1: 340, y1: 456, name: 'school', icon: 'school' }, { x0: 378, y0: 312, x1: 650, y1: 456, name: 'community center', icon: 'users' }];
  const SETTING = [[0, 9], [1, 4], [2, 6], [0, 6], [1, 3], [3, 6], [1, 2]];   // [zone, how many] for young x3, middle x2, older x2
  function start(container, user) {
    const opt = Object.assign({ mode: 'mixed', speed: 72, pInfect: 0.55, rec: [5000, 7000], visitRate: 0.025 }, user || {});
    const sortedMode = opt.mode === 'sorted', W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);

    // the people: seeded start positions, ages and faces
    const r0 = rng(11), P = [];
    const iconEl = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };
    const ages = [...Array(19).fill(0), ...Array(9).fill(1), ...Array(8).fill(2)];
    for (let i = ages.length - 1; i > 0; i--) { const j = Math.floor(r0() * (i + 1)); [ages[i], ages[j]] = [ages[j], ages[i]]; }
    while (P.length < 36) { const x = BOX.x0 + R + r0() * (BOX.x1 - BOX.x0 - 2 * R), y = BOX.y0 + R + r0() * (BOX.y1 - BOX.y0 - 2 * R);
      if (P.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 52 * 52)) continue;
      const a = r0() * 2 * Math.PI, k = P.length;
      P.push({ x, y, sx: x, sy: y, vx: Math.cos(a), vy: Math.sin(a), g: ages[k], style: Math.floor(r0() * 2), skin: Math.floor(r0() * 4) }); }

    const byGroup = [0, 1, 2].map(g => P.map((p, i) => p.g === g ? i : -1).filter(i => i >= 0));
    const plan = [[SETTING[0], SETTING[1], SETTING[2]], [SETTING[3], SETTING[4]], [SETTING[5], SETTING[6]]];
    plan.forEach((list, g) => { let k = 0; list.forEach(([z, n]) => { for (let q = 0; q < n; q++) P[byGroup[g][k++]].set = z; }); });

    // the containers
    const gBox = el('g', {});
    const one = el('rect', { x: BOX.x0 - 12, y: BOX.y0 - 12, width: BOX.x1 - BOX.x0 + 24, height: BOX.y1 - BOX.y0 + 24, rx: 22, fill: '#f6f8fa', stroke: '#d6dce4', 'stroke-width': 2 }, gBox);
    const zoneR = ZONES.map(z => { const g = el('g', { opacity: 0 }, gBox);
      el('rect', { x: z.x0 - 8, y: z.y0 - 36, width: z.x1 - z.x0 + 16, height: z.y1 - z.y0 + 44, rx: 18, fill: '#f6f8fa', stroke: '#d6dce4', 'stroke-width': 2 }, g);
      iconEl(z.x0 + 10, z.y0 - 17, 20, z.icon, '#8a94a6', g); txt(z.x0 + 26, z.y0 - 10, z.name, { 'font-size': 18, 'font-weight': 700, fill: '#6b7585' }, g);
      return g; });
    const gFlash = el('g', {}), gN = el('g', {});
    const cache = {}, href = (p, st, aged) => { const k = (aged ? p.g + '' + p.style + p.skin : 'gen') + st;
      return cache[k] || (cache[k] = 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(aged ? { age: AGES[p.g], style: p.style, skin: p.skin, state: st } : { generic: true, state: st }))); };
    const ims = P.map(() => el('image', { width: SIZE, height: SIZE }, gN));

    // ------------------------------------------------------------ right panel
    const cnt = {}, curve = {};
    let foi = () => {};                                                    // renders the force-of-infection formula once KaTeX is in
    if (!sortedMode) {                                                    // slide 2: the SIR counts
      // the compartments, joined by their rates: lambda (the force of infection) and mu (recovery)
      [['S', 'susceptible', '#2c7fb8'], ['I', 'infected', '#e8590c'], ['R', 'recovered', '#8a8a8a']].forEach(([k, name, c], i) => { const x = 730 + i * 150;
        el('rect', { x, y: 40, width: 104, height: 104, rx: 14, fill: '#fff', stroke: c, 'stroke-width': 3 });
        txt(x + 52, 30, name, { 'font-size': 19, fill: '#777', 'text-anchor': 'middle' });
        txt(x + 16, 108, k, { 'font-size': 40, 'font-weight': 700, fill: c });
        cnt[k] = txt(x + 92, 108, '', { 'font-size': 34, 'font-weight': 700, fill: c, 'text-anchor': 'end' });
        if (i < 2) { const ax = x + 110, bx = x + 144, ac = i ? '#8a94a6' : '#e8590c';
          el('line', { x1: ax, y1: 92, x2: bx - 8, y2: 92, stroke: ac, 'stroke-width': 3 });
          el('path', { d: `M${bx},92 l-10,-6 l0,12 z`, fill: ac });
          txt((ax + bx) / 2, 80, i ? '\u03bc' : '\u03bb', { 'font-size': 24, 'font-style': 'italic', 'font-family': 'KaTeX_Main, Times New Roman, serif', fill: i ? '#6b7585' : '#e8590c', 'text-anchor': 'middle' }); }
        curve[k] = el('polyline', { fill: 'none', stroke: c, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }); });
      el('line', { x1: 730, y1: 318, x2: 1130, y2: 318, stroke: '#d0d0d0', 'stroke-width': 1.5 });
      txt(1130, 340, 'time', { 'font-size': 18, fill: '#888', 'text-anchor': 'end' });
      // the force of infection, boxed, under the curves (KaTeX, as on the other equation slides)
      el('rect', { x: 730, y: 372, width: 168, height: 86, rx: 12, fill: '#fff', stroke: '#e8590c', 'stroke-width': 3 });
      const fo = el('foreignObject', { x: 730, y: 372, width: 168, height: 86, overflow: 'visible' }), fd = document.createElement('div');
      fd.setAttribute('style', 'height:86px;display:flex;align-items:center;justify-content:center;font-size:30px;color:#222');
      fo.appendChild(fd);
      foi = () => { if (!window.katex || fd.childNodes.length) return; window.katex.render('\\textcolor{#e8590c}{\\lambda} = \\beta\\,\\dfrac{I}{N}', fd, { throwOnError: false }); };   // KaTeX may still be loading
      txt(916, 408, 'force of infection', { 'font-size': 21, 'font-weight': 700, fill: '#e8590c' });
      txt(916, 434, 'how fast a susceptible', { 'font-size': 18, fill: '#555' });
      txt(916, 456, 'person gets infected', { 'font-size': 18, fill: '#555' });
    }
    const YL = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494'];
    const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YL.length - 1), i = Math.min(YL.length - 2, Math.floor(k)), f = k - i;
      const p = h => [1, 3, 5].map(q => parseInt(h.slice(q, q + 2), 16)), A = p(YL[i]), B = p(YL[i + 1]);
      return `rgb(${A.map((x, q) => Math.round(x + (B[q] - x) * f)).join(',')})`; };
    const NG = [19, 9, 8], cellsM = [], view = {};
    let Mcount = null;
    if (sortedMode) {
      // older at the top and on the right, so the top-right corner is older meeting older (deck-wide
      // convention); 'older' arrows run along the two edges without faces
      const N = window.NOTRANDOM, MX = 800, MY = 66, Z = 72, rowY = a => MY + (2 - a) * Z;
      txt(MX + 1.5 * Z, 22, 'who meets whom, counted', { 'font-size': 22, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
        cellsM.push({ a, b, e: el('rect', { x: MX + b * Z, y: rowY(a), width: Z - 3, height: Z - 3, rx: 6, fill: '#f4f6f9' }) });
      AGES.forEach((age, g) => { face(MX - 30, rowY(g) + Z / 2 - 1, 40, { age, style: g % 2, skin: g + 1 }); face(MX + g * Z + Z / 2 - 1, MY + 3 * Z + 22, 38, { age, style: (g + 1) % 2, skin: g }); });
      const arrow = (x1, y1, x2, y2) => { el('line', { x1, y1, x2, y2, stroke: '#8a94a6', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
        const a = Math.atan2(y2 - y1, x2 - x1), h = 11;
        el('path', { d: `M${x2},${y2} L${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)} Z`, fill: '#8a94a6' }); };
      arrow(MX + 4, MY - 14, MX + 3 * Z - 6, MY - 14);
      txt(MX + 3 * Z - 4, MY - 22, 'older', { 'font-size': 18, fill: '#6b7585', 'text-anchor': 'end' });
      arrow(MX + 3 * Z + 12, MY + 3 * Z - 6, MX + 3 * Z + 12, MY + 4);
      txt(MX + 3 * Z + 22, MY + 4, 'older', { 'font-size': 18, fill: '#6b7585', transform: `rotate(90 ${MX + 3 * Z + 22} ${MY + 4})` });
      const gR = el('g', { opacity: 0 }); view.result = gR;
      el('line', { x1: 700, y1: 340, x2: 1130, y2: 340, stroke: '#d6dce4', 'stroke-width': 1.5 }, gR);
      txt(700, 372, 'over-65s infected by the end', { 'font-size': 22, 'font-weight': 700, fill: '#222' }, gR);
      txt(1130, 372, 'R\u2080 = 1.5', { 'font-size': 18, fill: '#888', 'text-anchor': 'end' }, gR);
      txt(700, 436, Math.round(N.attack_wm[2] * 100) + '%', { 'font-size': 60, 'font-weight': 700, fill: '#9aa4b2' }, gR);
      txt(700, 460, 'if everyone met everyone', { 'font-size': 20, fill: '#777' }, gR);
      txt(940, 436, Math.round(N.attack_real[2] * 100) + '%', { 'font-size': 60, 'font-weight': 700, fill: '#253494' }, gR);
      txt(940, 460, 'with survey contacts', { 'font-size': 20, fill: '#777' }, gR);
    }
    container.innerHTML = ''; container.appendChild(svg);

    // ------------------------------------------------------------ dynamics
    let state, until, touching, flashes, hist, lastSample, t0, raf = null, last = null, phase, aged;
    const set = (i, st) => { state[i] = st; ims[i].setAttribute('href', href(P[i], st, aged)); };
    function seedOutbreak(now) {
      state = P.map(() => 'S'); until = P.map(() => 0); touching = new Set(); flashes = []; hist = []; lastSample = now;
      P.forEach((_, i) => set(i, 'S'));
      const pool = P.map((p, i) => p.g === 0 ? i : -1).filter(i => i >= 0), s = pool[Math.floor(Math.random() * pool.length)];
      set(s, 'I'); until[s] = now + opt.rec[0] + Math.random() * (opt.rec[1] - opt.rec[0]);
    }
    function reset(now) {
      P.forEach((p, i) => { p.x = p.sx; p.y = p.sy; p.zone = -1; p.visit = null; p.flipped = false; p.home = p.g; ims[i].removeAttribute('transform'); });
      aged = false; phase = sortedMode ? 0 : 2; seedOutbreak(now);
      Mcount = [[NG[0] - 1, NG[1], NG[2]], [NG[0], NG[1] - 1, NG[2]], [NG[0], NG[1], NG[2] - 1]].map(r => r.map(v => v * 0.6));   // prior: the well-mixed shares
      one.setAttribute('opacity', 1); zoneR.forEach(z => z.setAttribute('opacity', 0)); if (view.result) view.result.setAttribute('opacity', 0);
    }
    const bounds = p => p.zone < 0 ? BOX : ZONES[p.visit !== null ? p.visit : p.zone];
    const ease = u => u * u * (3 - 2 * u), cl = u => Math.max(0, Math.min(1, u));
    function frame(t) {
      if (t0 === null) { t0 = t; last = t; reset(t); }
      foi();
      const dt = Math.min(0.05, (t - last) / 1000), e = t - t0; last = t;
      // slide 3's choreography: turn over, then split the box and send everyone home
      if (sortedMode && phase === 0) {
        P.forEach((p, i) => { const u = cl((e - 500 - i * 35) / 500), sx = Math.abs(Math.cos(Math.PI * u));
          if (u >= 0.5 && !p.flipped) { p.flipped = true; aged = true; ims[i].setAttribute('href', href(p, state[i], true)); }
          ims[i].setAttribute('transform', `translate(${p.x},${p.y}) scale(${Math.max(sx, 0.02)},1) translate(${-p.x},${-p.y})`); });
        if (e > 2500) { phase = 1; P.forEach(p => { const z = ZONES[p.set]; p.zone = -2; p.fx = p.x; p.fy = p.y;
          p.tx = z.x0 + R + Math.random() * (z.x1 - z.x0 - 2 * R); p.ty = z.y0 + R + Math.random() * (z.y1 - z.y0 - 2 * R); }); }
      }
      if (sortedMode && phase === 1) {                                    // glide home while the box splits
        const m = ease(cl((e - 2500) / 1700));
        one.setAttribute('opacity', 1 - m); zoneR.forEach(z => z.setAttribute('opacity', m));
        P.forEach(p => { p.x = p.fx + (p.tx - p.fx) * m; p.y = p.fy + (p.ty - p.fy) * m; });
        if (m >= 1) { phase = 2; P.forEach(p => { p.zone = p.set; }); seedOutbreak(t); }
      }
      // drift and bounce (mass action); occasional visits to another neighbourhood once sorted
      if (phase !== 1) P.forEach(p => {
        if (sortedMode && phase === 2) {
          if (p.visit === null && Math.random() < opt.visitRate * dt) { p.visit = [0, 1, 2, 3].filter(z => z !== p.zone)[Math.floor(Math.random() * 3)]; p.back = t + 3500 + Math.random() * 2500; }
          else if (p.visit !== null && t > p.back) p.visit = null;
        }
        const b = bounds(p), inside = p.x >= b.x0 + R && p.x <= b.x1 - R && p.y >= b.y0 + R && p.y <= b.y1 - R;
        if (!inside) { const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, d = Math.hypot(cx - p.x, cy - p.y) || 1;   // head for the target area
          p.vx = (cx - p.x) / d; p.vy = (cy - p.y) / d; }
        else { p.vx += (Math.random() - 0.5) * 0.6 * dt * 10; p.vy += (Math.random() - 0.5) * 0.6 * dt * 10; const n = Math.hypot(p.vx, p.vy) || 1; p.vx /= n; p.vy /= n; }
        p.x += p.vx * opt.speed * dt; p.y += p.vy * opt.speed * dt;
        if (inside) { if (p.x < b.x0 + R || p.x > b.x1 - R) p.vx *= -1; if (p.y < b.y0 + R || p.y > b.y1 - R) p.vy *= -1;
          p.x = Math.max(b.x0 + R, Math.min(b.x1 - R, p.x)); p.y = Math.max(b.y0 + R, Math.min(b.y1 - R, p.y)); }
      });
      P.forEach((p, i) => { ims[i].setAttribute('x', p.x - SIZE / 2); ims[i].setAttribute('y', p.y - SIZE / 2);
        if (!(sortedMode && phase === 0)) ims[i].removeAttribute('transform'); });
      // meetings: a pair that comes within touching distance meets once; infection can pass
      if (phase !== 1) for (let i = 0; i < 36; i++) for (let j = i + 1; j < 36; j++) {
        const k = i * 36 + j, close = (P[i].x - P[j].x) ** 2 + (P[i].y - P[j].y) ** 2 < TOUCH * TOUCH;
        if (close) {                                                      // bounce apart, like billiard balls
          const A = P[i], B = P[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d, push = (TOUCH - d) / 2;
          A.x -= nx * push; A.y -= ny * push; B.x += nx * push; B.y += ny * push;
          const rel = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
          if (rel < 0) { A.vx += rel * nx; A.vy += rel * ny; B.vx -= rel * nx; B.vy -= rel * ny; } }
        if (close && !touching.has(k)) { touching.add(k); flashes.push({ i, j, t });
          if (Mcount) { const a = P[i].g, b = P[j].g; Mcount[a][b] += 1; Mcount[b][a] += 1; }
          [[i, j], [j, i]].forEach(([a, b]) => { if (state[a] === 'I' && state[b] === 'S' && Math.random() < opt.pInfect) { set(b, 'I'); until[b] = t + opt.rec[0] + Math.random() * (opt.rec[1] - opt.rec[0]); } }); }
        else if (!close) touching.delete(k);
      }
      P.forEach((_, i) => { if (state[i] === 'I' && t > until[i]) set(i, 'R'); });
      gFlash.innerHTML = '';
      flashes = flashes.filter(f => { const u = (t - f.t) / 600; if (u >= 1) return false;
        const inf = state[f.i] === 'I' || state[f.j] === 'I';
        el('line', { x1: P[f.i].x, y1: P[f.i].y, x2: P[f.j].x, y2: P[f.j].y, stroke: inf ? '#e8590c' : '#8a94a6', 'stroke-width': 3, opacity: 1 - u, 'stroke-linecap': 'round' }, gFlash); return true; });
      // slide 2: counts and curves; restart when the outbreak is over
      if (t - lastSample > 400) { lastSample = t; const c = { S: 0, I: 0, R: 0 }; state.forEach(s => c[s]++); hist.push(c);
        if (cnt.S) { const span = Math.max(30, hist.length - 1);
          ['S', 'I', 'R'].forEach(k => { cnt[k].textContent = c[k]; curve[k].setAttribute('points', hist.map((h, q) => `${730 + q * 400 / span},${318 - h[k] / 36 * 150}`).join(' ')); }); }
        if (c.I === 0 && phase === 2) { if (!sortedMode) { t0 = null; } else seedOutbreak(t + 1500); } }
      // slide 3: the table, from recent meetings, and the result
      if (sortedMode && Mcount) {
        const decay = Math.pow(0.82, dt); Mcount = Mcount.map(r => r.map(v => v * decay));
        const S = Mcount.map(r => { const s = r[0] + r[1] + r[2]; return r.map(v => v / s); });
        cellsM.forEach(c => c.e.setAttribute('fill', ramp(S[c.a][c.b])));
        // the result waits for the click (step 1); it fades in from the moment the step arrives
        if (view.step >= 1 && view.shownAt == null) view.shownAt = t;
        if (view.step < 1) view.shownAt = null;
        view.result.setAttribute('opacity', view.shownAt == null ? 0 : cl((t - view.shownAt) / 600));
      }
      raf = requestAnimationFrame(frame);
    }
    view.step = 0;
    return { play() { t0 = null; if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; },
             step(n) { view.step = n; } };
  }
  window.startCrowd = start;
})();
