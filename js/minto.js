// "The matrix goes into the force of infection" (after the settings slide), playing by itself in stages:
//   0  the survey's adult all-contacts table (js/settings-data.js), older at the top
//   1  the table collapses into one symbol, M
//   2  the SIR intro's force of infection comes back (lambda = beta I / N) and M flies into its
//      stratified form, lambda_a = beta sum_b M[a,b] I_b / N_b
//   3  three age groups, each with its own S -> I -> R; with an outbreak among young adults, each group's
//      S -> I arrow is as wide as its force of infection, proportional to M[a, young]
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'];
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const col = v => { const lo = Math.log(0.05), hi = Math.log(4.2), u = Math.max(0, Math.min(1, (Math.log(Math.max(v, 0.05)) - lo) / (hi - lo)));
    const k = u * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const M = window.SETTINGS.Total, W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);
    // equations are typeset by KaTeX (as on the SIR slide), in a foreignObject box centred vertically
    const pending = [], flush = () => { while (window.katex && pending.length) pending.shift()(); };   // KaTeX may still be loading
    const kx = (x, y, w, h, tex, size, color, p) => { const fo = el('foreignObject', { x, y, width: w, height: h, overflow: 'visible' }, p);
      const d = document.createElement('div'); d.setAttribute('style', `height:${h}px;display:flex;align-items:center;font-size:${size}px;color:${color};white-space:nowrap`);
      fo.appendChild(d); pending.push(() => window.katex.render(tex, d, { trust: true, strict: false, throwOnError: false })); flush(); return d; };
    const MFONT = { 'font-family': 'KaTeX_Math, Times New Roman, serif', 'font-style': 'italic', 'font-weight': 700 };

    // ---------------------------------------------------------------- left: the table, then M
    const Z = 84, MX = 116, MY = 92, rowY = a => MY + (2 - a) * Z, CX = MX + 1.5 * Z, CY = MY + 1.5 * Z;
    const gTab = el('g', {});
    const tabTitle = txt(CX, 40, 'all contacts', { 'font-size': 24, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' }, gTab);
    const cells = [];
    M.forEach((row, a) => row.forEach((v, b) => cells.push({ x: MX + b * Z, y: rowY(a), e: el('rect', { x: MX + b * Z, y: rowY(a), width: Z - 3, height: Z - 3, rx: 6, fill: col(v) }, gTab) })));
    const gAx = el('g', {}, gTab);
    AGES.forEach((age, g) => { face(MX - 32, rowY(g) + Z / 2, 42, { age, style: g % 2, skin: (g + 1) % 4 }, gAx); face(MX + g * Z + Z / 2, MY + 3 * Z + 26, 40, { age, style: (g + 1) % 2, skin: (g + 2) % 4 }, gAx); });
    const bigM = txt(CX, CY, 'M', Object.assign({ 'font-size': 210, fill: '#253494', 'text-anchor': 'middle', 'dominant-baseline': 'central', opacity: 0 }, MFONT));
    const mCap = txt(CX, CY + 128, 'the contact matrix', { 'font-size': 22, fill: '#555', 'text-anchor': 'middle', opacity: 0 });

    // ---------------------------------------------------------------- right: lambda, before and now
    const EX = 470, gEq = el('g', { opacity: 0 }), gNow = el('g', { opacity: 0 });
    txt(EX, 40, 'everyone meets everyone', { 'font-size': 20, fill: '#888' }, gEq);
    kx(EX - 4, 50, 600, 100, '\\lambda = \\beta\\,\\dfrac{I}{N}', 32, '#888', gEq);
    txt(EX, 178, 'with the contact matrix', { 'font-size': 20, fill: '#253494', 'font-weight': 700 }, gNow);
    const nowDiv = kx(EX - 4, 186, 660, 104, '\\lambda_a = \\beta \\sum_b \\htmlClass{mslot}{\\textcolor{#253494}{\\boldsymbol{M}}}[a, b]\\,\\dfrac{I_b}{N_b}', 38, '#222', gNow);
    const fly = txt(0, 0, 'M', Object.assign({ 'font-size': 46, fill: '#253494', opacity: 0 }, MFONT));   // plain baseline, start anchor: placed by its box

    // ---------------------------------------------------------------- right, below: three groups, coupled by M
    // An outbreak among young adults: each group's force of infection is beta M[a, young] I_young / N_young,
    // so its S -> I arrow is drawn as wide as M[a, young], and infections (dots) flow along it at that rate.
    const gSIR = el('g', { opacity: 0 }), SX = 530, BW = 50, ry = g => 330 + (2 - g) * 57, flows = [];
    const yv = M.map(r => r[0]), ymax = Math.max(...yv);
    AGES.forEach((age, g) => { const y = ry(g), w = yv[g] / ymax;
      face(SX - 50, y, 40, { age, style: g % 2, skin: (g + 1) % 4 }, gSIR);
      [['S', '#2c7fb8', 0], ['I', '#e8590c', 1], ['R', '#8a8a8a', 2]].forEach(([s, c, i]) => { const x = SX + i * 145;
        el('rect', { x, y: y - BW / 2, width: BW, height: BW, rx: 9, fill: s === 'I' && g === 0 ? '#fde6d8' : '#fff', stroke: c, 'stroke-width': 3 }, gSIR);
        txt(x + BW / 2, y + 9, s, { 'font-size': 24, 'font-weight': 700, fill: c, 'text-anchor': 'middle' }, gSIR); });
      const x1 = SX + BW + 8, x2 = SX + 145 - 14;                         // S -> I, as wide as this group's lambda
      el('line', { x1, y1: y, x2, y2: y, stroke: '#e8590c', 'stroke-width': 2 + 12 * w, opacity: 0.35, 'stroke-linecap': 'round' }, gSIR);
      el('path', { d: `M${x2 + 12},${y} l-12,-8 l0,16 z`, fill: '#e8590c' }, gSIR);
      el('line', { x1: SX + 145 + BW + 8, y1: y, x2: SX + 290 - 14, y2: y, stroke: '#8a94a6', 'stroke-width': 2.5 }, gSIR);
      el('path', { d: `M${SX + 290 - 2},${y} l-12,-7 l0,14 z`, fill: '#8a94a6' }, gSIR);
      { const g3 = ['young', 'middle', 'older'][g]; kx(SX + 145 * 2 + BW + 14, y - 22, 300, 44, `\\lambda_{\\text{${g3}}} \\propto \\textcolor{#253494}{\\boldsymbol{M}}[\\text{${g3}},\\,\\text{young}]`, 18, '#253494', gSIR); }
      flows.push({ x1, x2, y, w }); });
    const gDots = el('g', {}, gSIR);
    container.innerHTML = ''; container.appendChild(svg);
    let slot = null;                                                         // the flying M lands on KaTeX's own M, once rendered
    const findSlot = () => { if (!slot && (slot = nowDiv.querySelector('.mslot'))) slot.style.opacity = 0; };

    // ---------------------------------------------------------------- steps
    // plays by itself (no clicks): the stages start at these times after the slide opens
    const AUTO = [0, 1100, 3000, 5600];
    let n = 0, at = [0, 0, 0, 0], raf = null, dots = [], lastDot = 0, t0 = null;
    const cl = u => Math.max(0, Math.min(1, u)), ease = u => u * u * (3 - 2 * u);
    function frame(t) {
      if (t0 === null) t0 = t;
      flush(); findSlot();
      while (n < 3 && t - t0 >= AUTO[n + 1]) { n++; at[n] = t0 + AUTO[n]; }
      const since = k => t - at[k];
      // 1: the table collapses to M
      const c = n >= 1 ? ease(cl(since(1) / 900)) : 0;
      cells.forEach(o => { const x = o.x + (CX - Z / 2 - o.x) * c, y = o.y + (CY - Z / 2 - o.y) * c, s = 1 - 0.7 * c;
        o.e.setAttribute('transform', `translate(${x + Z / 2},${y + Z / 2}) scale(${s}) translate(${-o.x - Z / 2},${-o.y - Z / 2})`); o.e.setAttribute('opacity', 1 - c); });
      gAx.setAttribute('opacity', 1 - c); tabTitle.setAttribute('opacity', 1 - c);
      bigM.setAttribute('opacity', n >= 1 ? cl((since(1) - 500) / 500) : 0); mCap.setAttribute('opacity', n >= 1 ? cl((since(1) - 700) / 500) : 0);
      // 2: lambda before, then M flies into lambda now
      gEq.setAttribute('opacity', n >= 2 ? cl(since(2) / 500) : 0); gNow.setAttribute('opacity', n >= 2 ? cl((since(2) - 400) / 500) : 0);
      if (n >= 2 && slot) { const f = ease(cl((since(2) - 900) / 900)), r = slot.getBoundingClientRect(), inv = svg.getScreenCTM().inverse();
        // both ends measured the same way: the top-left of a glyph's box, at its real font size. The start is
        // the big ghost M; the end is KaTeX's own M (its innermost span), so the landing is exact.
        const g = [...slot.querySelectorAll('*')].find(e => !e.children.length && e.textContent === 'M') || slot, gr = g.getBoundingClientRect(), tl = new DOMPoint(gr.left, gr.top).matrixTransform(inv);
        const zEnd = parseFloat(getComputedStyle(g).fontSize), bm = bigM.getBBox();
        const box = z => { fly.setAttribute('x', 0); fly.setAttribute('y', 0); fly.setAttribute('font-size', z); return fly.getBBox(); };
        const b0 = box(210), x0 = bm.x - b0.x, y0 = bm.y - b0.y, b1 = box(zEnd), x1 = tl.x - b1.x, y1 = tl.y - b1.y;
        fly.setAttribute('x', x0 + (x1 - x0) * f); fly.setAttribute('y', y0 + (y1 - y0) * f); fly.setAttribute('font-size', 210 + (zEnd - 210) * f);
        fly.setAttribute('opacity', f > 0 && f < 1 ? 1 : 0); slot.style.opacity = f >= 1 ? 1 : 0;
        bigM.setAttribute('opacity', f > 0 ? 0.12 : bigM.getAttribute('opacity'));
      } else { fly.setAttribute('opacity', 0); if (slot) slot.style.opacity = 0; }
      // 3: three groups and the outbreak's reach
      gSIR.setAttribute('opacity', n >= 3 ? cl(since(3) / 600) : 0);
      if (n >= 3 && t - lastDot > 180) { lastDot = t; flows.forEach(f => { if (Math.random() < f.w * 0.7) dots.push({ f, t }); }); }
      gDots.innerHTML = '';
      dots = dots.filter(d => { const u = (t - d.t) / 1100; if (u >= 1) return false;
        el('circle', { cx: d.f.x1 + (d.f.x2 - d.f.x1) * u, cy: d.f.y, r: 5, fill: '#e8590c' }, gDots); return true; });
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startMinto = start;
})();
