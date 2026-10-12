// Slide 4, "How a contact matrix is built", after Fumanelli et al. 2012 (PLOS Comput Biol), Fig. 1.
// Two households: A (adults 31 and 31, children 5 and 6) and B (adult 31, child 5). Each person splits
// their household contacts equally among the others (1 / (household size - 1)). Rows are the person's
// age and columns the age of whom they meet (the deck's convention; the paper draws the transpose).
// Household A and its empty grid open with the slide; then, clicked through (steps, see stepSync in
// index.html), one row at a time: 1 A's 31-year-olds, 2 A's 6-year-old, 3 A's 5-year-old, 4 household B
// appears and its 31-year-old, 5 B's 5-year-old. Within a row each cell is built in turn: arrows from each
// giver to each receiver (a third each in A, a whole one in B), then the cell fills and its sum shows. 6 the two are
// added and divided by the number of people of each age, giving the population matrix (row 5: 1/6, 5/6;
// row 6: 1/3, 2/3; row 31: 5/9, 2/9, 2/9, as in the paper), with the note saying so. Older ages sit at the
// top of each matrix (deck-wide convention).
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = [5, 6, 31];
  const YL = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8'];
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const frac = (n, d) => { if (!n) return ''; const g = gcd(n, d); return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`; };
  const HH = [[31, 31, 5, 6], [31, 5]];
  function start(container) {
    const W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);

    // one matrix: 3 x 3 cells with row and column age labels; returns cell setters
    // each matrix lives in its own group, hidden until its step (no empty grids waiting on the slide)
    function matrix(x0, y0, z, title, sub) {
      const g = el('g', { opacity: 0 });
      txt(x0 + 1.5 * z, y0 - 34, title, { 'font-size': 22, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' }, g);
      if (sub) txt(x0 + 1.5 * z, y0 - 12, sub, { 'font-size': 18, fill: '#777', 'text-anchor': 'middle' }, g);
      const ry = r => y0 + (2 - r) * z;                                  // older at the top
      AGES.forEach((a, i) => { txt(x0 - 10, ry(i) + z / 2 + 7, a, { 'font-size': 20, fill: '#555', 'text-anchor': 'end' }, g);
        txt(x0 + i * z + z / 2, y0 + 3 * z + 24, a, { 'font-size': 20, fill: '#555', 'text-anchor': 'middle' }, g); });
      const cells = AGES.map((_, r) => AGES.map((_, c) => {
        const rect = el('rect', { x: x0 + c * z, y: ry(r), width: z - 2, height: z - 2, rx: 4, fill: '#f4f6f9' }, g);
        const t = txt(x0 + c * z + z / 2 - 1, ry(r) + z / 2 + 7, '', { 'font-size': z > 60 ? 22 : 20, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' }, g);
        return { rect, t }; }));
      const set = (r, c, n, d) => { const v = n / d, k = Math.min(YL.length - 1, Math.round(v * (YL.length - 1)));
        cells[r][c].rect.setAttribute('fill', n ? YL[Math.max(1, k)] : '#f4f6f9'); cells[r][c].t.textContent = frac(n, d);
        cells[r][c].t.setAttribute('fill', k >= 5 ? '#fff' : '#222'); };
      set.g = g; return set;
    }

    // households, each a card with its people
    const people = [], cards = [];
    HH.forEach((hh, h) => { const y0 = 12 + h * 240, g = el('g', { opacity: 0 }); cards.push(g);
      el('rect', { x: 0, y: y0, width: 330, height: 200, rx: 16, fill: '#f4f6f9' }, g);
      icon(34, y0 + 32, 34, 'house', '#8a94a6', g); txt(60, y0 + 40, `household ${'AB'[h]}`, { 'font-size': 22, 'font-weight': 700, fill: '#444' }, g);
      hh.forEach((age, i) => { const x = 56 + i * (hh.length === 4 ? 72 : 100), adult = age > 18, z = adult ? 62 : 46, y = y0 + 118 + (adult ? 0 : 8);
        const ring = el('circle', { cx: x, cy: y, r: z / 2 + 7, fill: 'none', stroke: '#253494', 'stroke-width': 3.5, opacity: 0 }, g);
        face(x, y, z, { age: 'young', style: (i + h) % 2, skin: (i + 2 * h) % 4 }, g);
        txt(x, y0 + 186, age, { 'font-size': 22, 'font-weight': 700, fill: '#444', 'text-anchor': 'middle' }, g);
        people.push({ h, i, age, ring, x, y, z }); }); });
    const setA = matrix(440, 50, 46, 'household A', null), setB = matrix(440, 314, 46, 'household B', null);
    const plus = txt(440 + 69, 246, '+', { 'font-size': 36, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle', opacity: 0 });
    const equals = txt(720, 272, '=', { 'font-size': 44, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle', opacity: 0 });
    const setP = matrix(810, 140, 84, 'the population', null);
    const avgNote = txt(810 + 126, 140 + 3 * 84 + 62, 'add the households, divide by people of each age', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle', opacity: 0 });
    container.innerHTML = ''; container.appendChild(svg);

    // ---- arrows: who gives contact to whom, drawn per cell; a pair giving to each other uses one arc above, one below
    const NS2 = NS, defs = el('defs', {}), gArr = el('g', {}), gSum = el('g', {});
    const mk = document.createElementNS(NS2, 'marker'); [['id', 'hh-arrow'], ['viewBox', '0 0 10 10'], ['refX', 8.5], ['refY', 5], ['markerWidth', 6.5], ['markerHeight', 6.5], ['orient', 'auto']].forEach(([k, v]) => mk.setAttribute(k, v));
    const tip = document.createElementNS(NS2, 'path'); tip.setAttribute('d', 'M0,0 L10,5 L0,10 z'); tip.setAttribute('fill', '#253494'); mk.appendChild(tip); defs.appendChild(mk);
    const arc = (g, r, below) => { const A = people[g], B = people[r], d = Math.abs(A.x - B.x);
      const ya = below ? A.y + A.z / 2 + 3 : A.y - A.z / 2 - 3, yb = below ? B.y + B.z / 2 + 3 : B.y - B.z / 2 - 3;
      const cy = below ? Math.max(ya, yb) + 5 + 0.03 * d : Math.min(ya, yb) - 14 - 0.12 * d;   // the lower arc clears the age labels
      const p = el('path', { d: `M${A.x},${ya} Q${(A.x + B.x) / 2},${cy} ${B.x},${yb}`, fill: 'none', stroke: '#253494', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0 }, gArr);
      return p; };
    // the steps: one per row of each household, cells in the order given; then the population.
    // people: household A = 0 (31), 1 (31), 2 (5), 3 (6); household B = 4 (31), 5 (5)
    const STEPS = [null,
      [{ h: 0, r: 31, c: 5, e: [[0, 2], [1, 2]] }, { h: 0, r: 31, c: 6, e: [[0, 3], [1, 3]] }, { h: 0, r: 31, c: 31, e: [[0, 1], [1, 0]] }],
      [{ h: 0, r: 6, c: 31, e: [[3, 0], [3, 1]] }, { h: 0, r: 6, c: 5, e: [[3, 2]] }],
      [{ h: 0, r: 5, c: 31, e: [[2, 0], [2, 1]] }, { h: 0, r: 5, c: 6, e: [[2, 3]] }],
      [{ h: 1, r: 31, c: 5, e: [[4, 5]] }],
      [{ h: 1, r: 5, c: 31, e: [[5, 4]] }]];
    const MX = [440, 440], MY = [50, 314], MZ = 46, rowY = (h, age) => MY[h] + (2 - AGES.indexOf(age)) * MZ;
    STEPS.forEach(st => st && st.forEach(cell => {
      const pairs = cell.e.map(([g, r]) => g + ',' + r), back = cell.e.map(([g, r], k) => pairs.includes(r + ',' + g) && k > 0);
      cell.paths = cell.e.map(([g, r], k) => arc(g, r, back[k]));
      cell.num = cell.h ? 3 * cell.e.length : cell.e.length;                  // in thirds
      const sum = cell.h ? '1' : (cell.e.length === 2 ? '1/3 + 1/3 = 2/3' : '1/3');
      cell.label = txt(MX[cell.h] + 3 * MZ + 10, rowY(cell.h, cell.r) + MZ / 2 + 6, sum, { 'font-size': 17, 'font-weight': 700, fill: '#253494', opacity: 0 }, gSum); }));
    container.innerHTML = ''; container.appendChild(svg);

    // ---- the arithmetic and the clock
    const NUM = { 5: 2, 6: 1, 31: 3 }, CELL = 1600, DRAW = 650, FILL = 750, OFF = [0, 0, 0, 0, 450, 0, 0];
    let n = 0, arrived = [0, 0, 0, 0, 0, 0, 0], raf = null;
    const cl = u => Math.max(0, Math.min(1, u));
    function frame(t) {
      const since = k => t - arrived[k] - OFF[k];
      cards[0].setAttribute('opacity', 1); setA.g.setAttribute('opacity', 1);
      [cards[1], setB.g, plus].forEach(e => e.setAttribute('opacity', n >= 4 ? cl((t - arrived[4]) / 400) : 0));
      [setP.g, equals].forEach(e => e.setAttribute('opacity', n >= 6 ? cl(since(6) / 400) : 0));
      const acc = HH.map(() => AGES.map(() => AGES.map(() => 0)));
      people.forEach(p => p.ring.setAttribute('opacity', 0));
      for (let k = 1; k <= 5; k++) STEPS[k].forEach((cell, ci) => {
        const local = k < n ? 1e9 : k === n ? since(k) - ci * CELL : -1;      // time into this cell
        const done = local >= FILL, last = ci === STEPS[k].length - 1, live = k === n && local >= 0 && (local < CELL || last);
        if (done) acc[cell.h][AGES.indexOf(cell.r)][AGES.indexOf(cell.c)] += cell.num;
        const u = live ? cl(local / DRAW) : 0, fade = live && !last ? 1 - cl((local - CELL + 260) / 260) : 1;
        cell.paths.forEach(p => { const L = p.getTotalLength(); p.setAttribute('stroke-dasharray', L); p.setAttribute('stroke-dashoffset', L * (1 - u));
          p.setAttribute('opacity', live ? fade : 0); p.setAttribute('marker-end', live && u > 0.92 ? 'url(#hh-arrow)' : 'none'); });
        cell.label.setAttribute('opacity', live && done ? fade : 0);
      });
      AGES.forEach((a, r) => AGES.forEach((_, c) => { setA(r, c, acc[0][r][c], 3); setB(r, c, acc[1][r][c], 3);
        setP(r, c, n >= 6 ? acc[0][r][c] + acc[1][r][c] : 0, 3 * NUM[a]); }));
      avgNote.setAttribute('opacity', n >= 6 ? cl((since(6) - 500) / 400) : 0);
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; },
             step(k) { const now = performance.now();                       // a jump (coming back from the next slide) lands finished
               if (k === n + 1) arrived[k] = now; else for (let q = 0; q <= 6; q++) arrived[q] = now - 1e6;
               n = k; } };
  }
  window.startHousehold = start;
})();
