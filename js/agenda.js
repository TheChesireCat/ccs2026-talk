// The agenda (after Matteo): four parts, each with a small picture of itself. Cards fade in left to
// right. With { current: k } (the reprise before the phones part) it opens finished, part k outlined and
// the others dimmed, so the audience sees where the talk is.
//   1 how epidemic models work      SIR boxes
//   2 mixing patterns               a small contact matrix (the survey's adult all-contacts table)
//   3 what phones can tell us       phones linked by who was near whom
//   4 what behaviour promises       an hour-by-hour day, home and work
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const col = v => { const lo = Math.log(0.05), hi = Math.log(4.2), u = Math.max(0, Math.min(1, (Math.log(Math.max(v, 0.05)) - lo) / (hi - lo)));
    const k = u * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  const PARTS = [['How epidemic', 'models work'], ['Mixing patterns'], ['What phones', 'can tell us'], ['What behaviour', 'promises']];
  function start(container, user) {
    const opt = Object.assign({ current: 0 }, user || {}), W = 1150, H = 455, CW = 262, GAP = 22, X0 = (W - 4 * CW - 3 * GAP) / 2, CH = 340, CY = (H - CH) / 2;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };

    const cards = PARTS.map((lines, k) => {
      const x0 = X0 + k * (CW + GAP), g = el('g', { opacity: 0 }), on = opt.current === k + 1;
      el('rect', { x: x0, y: CY, width: CW, height: CH, rx: 18, fill: '#f4f6f9', stroke: on ? '#253494' : 'none', 'stroke-width': 3 }, g);
      el('circle', { cx: x0 + 40, cy: CY + 44, r: 20, fill: '#253494' }, g);
      txt(x0 + 40, CY + 52, String(k + 1), { 'font-size': 22, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }, g);
      lines.forEach((l, i) => txt(x0 + 24, CY + 108 + i * 28, l, { 'font-size': 24, 'font-weight': 700, fill: '#222' }, g));
      // every picture is centred in the same frame, about 210 x 150, just under the title
      const vx = x0 + CW / 2, vy = CY + 238;                               // ~25 px under the title, ~25 px above the card's foot
      if (k === 0) {                                                       // S -> I -> R, centres at -78, 0, +78
        const B = 54;
        [['S', '#2c7fb8'], ['I', '#e8590c'], ['R', '#8a8a8a']].forEach(([s, c], i) => { const x = vx + (i - 1) * 78;
          el('rect', { x: x - B / 2, y: vy - B / 2, width: B, height: B, rx: 10, fill: '#fff', stroke: c, 'stroke-width': 3 }, g);
          txt(x, vy + 10, s, { 'font-size': 28, 'font-weight': 700, fill: c, 'text-anchor': 'middle' }, g);
          if (i < 2) { el('line', { x1: x + B / 2 + 3, y1: vy, x2: x + 78 - B / 2 - 10, y2: vy, stroke: '#8a94a6', 'stroke-width': 2.5 }, g);
            el('path', { d: `M${x + 78 - B / 2 - 3},${vy} l-8,-5 l0,10 z`, fill: '#8a94a6' }, g); } });
      } else if (k === 1) {                                                // a 3 x 3 contact matrix, 144 square, older at the top
        const M = (window.SETTINGS || {}).Total || [[2, 1, .5], [1, 1.5, .6], [.5, .6, 1.2]], z = 48;
        M.forEach((row, a) => row.forEach((v, b) => el('rect', { x: vx - 1.5 * z + b * z + 1.5, y: vy - 1.5 * z + (2 - a) * z + 1.5, width: z - 3, height: z - 3, rx: 6, fill: col(v) }, g)));
      } else if (k === 2) {                                                // six phones on a ring, linked by who was near whom
        const P = [0, 1, 2, 3, 4, 5].map(i => [vx + 82 * Math.cos(i * Math.PI / 3 - Math.PI / 2 + Math.PI / 6), vy + 58 * Math.sin(i * Math.PI / 3 - Math.PI / 2 + Math.PI / 6)]);
        [[0, 2], [0, 3], [1, 2], [2, 4], [3, 5], [1, 5], [0, 4]].forEach(([i, j], q) => el('line', { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: '#8f96c9', 'stroke-width': q < 2 ? 5 : 2.5 }, g));
        P.forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 19, fill: '#fff', stroke: '#c9cede', 'stroke-width': 2 }, g); icon(x, y, 22, 'mobile-screen-button', '#253494', g); });
      } else {                                                             // three days, hour by hour: 7 x 3 boxes, 206 x 102
        const day = [['house', 'briefcase', 'briefcase', 'briefcase', 'briefcase', 'house', 'house'], ['house', 'house', 'bag-shopping', 'bag-shopping', 'house', 'house', 'house'],
                     ['house', 'house', 'house', 'house', 'house', 'house', 'house']], S = 30, Q = 26, R = 38;
        day.forEach((row, r) => row.forEach((ic, i) => { const x = vx - (6 * S + Q) / 2 + i * S, y = vy - (2 * R + Q) / 2 + r * R;
          el('rect', { x, y, width: Q, height: Q, rx: 5, fill: ic === 'house' ? '#253494' : ic === 'briefcase' ? '#2c7fb8' : '#5fb8a6' }, g);
          icon(x + Q / 2, y + Q / 2, 15, ic, '#fff', g); }));
      }
      return { g, dim: opt.current && !on };
    });
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = opt.current ? t - 1e6 : t;
      const e = t - t0;
      cards.forEach((c, k) => c.g.setAttribute('opacity', Math.max(0, Math.min(1, (e - 200 - k * 450) / 450)) * (c.dim ? 0.35 : 1)));
      raf = e < 2400 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startAgenda = start;
})();
