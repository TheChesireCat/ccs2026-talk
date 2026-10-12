// "Phones already see who is near whom": a day of phones moving between places, the contacts that
// co-presence makes, and the tables that can be built from it for any place and any week.
//
// Left: three homes, a workplace, a restaurant and a shop, on two tinted zones (at home / out of the house). Eight phones follow simple daily
// schedules; when two phones are at the same place (not a home) in the same hour, a line joins them.
// Phones carry no age: that is the catch on the next slide. Right, top: the contact network for the
// day, an edge thickening with every hour two phones share a place. Right, bottom: the payoff, a
// fresh table for every place and every week; tiles fill in as each day ends. Illustrative, not data.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const YLGNBU = ['#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494'];
  const PLACES = [
    { x: 80, y: 112, icon: 'house', home: true }, { x: 80, y: 240, icon: 'house', home: true }, { x: 80, y: 370, icon: 'house', home: true },
    { x: 420, y: 112, icon: 'briefcase' }, { x: 540, y: 255, icon: 'pizza-slice' }, { x: 330, y: 370, icon: 'bag-shopping' } ];
  const H0 = 0, H1 = 1, H2 = 2, WK = 3, FD = 4, SH = 5;
  // one schedule per phone: a place for each clock hour, built from home + a few visits
  const day = (home, visits) => { const s = Array(24).fill(home); for (const [p, a, b] of visits) for (let h = a; h <= (b == null ? a : b); h++) s[h] = p; return s; };
  // three office workers, a shop worker and a restaurant worker (the hubs), and three people running
  // errands: about ten pairs meet in a day, so the network keeps visible structure
  const SCHED = [
    day(H0, [[WK, 8, 16], [FD, 12]]), day(H0, [[WK, 9, 17]]), day(H1, [[SH, 10, 11], [FD, 13]]),
    day(H1, [[WK, 8, 15], [SH, 16]]), day(H2, [[SH, 9, 17]]), day(H2, [[FD, 18, 19]]),
    day(H0, [[SH, 16, 17]]), day(H1, [[FD, 10, 19]]) ];
  const NP = SCHED.length;
  function start(container, user) {
    const opt = Object.assign({ hour: 640, night: 170, hold: 1800 }, user || {});
    const W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };

    // ---------------------------------------------------------------- left: the places
    // two zones behind the map, so home and out of the house read apart at a glance
    el('rect', { x: 0, y: 0, width: 168, height: 452, rx: 18, fill: '#eef0f6' });
    el('rect', { x: 192, y: 0, width: 456, height: 452, rx: 18, fill: '#e6f3f5' });
    txt(16, 26, 'at home', { 'font-size': 20, 'font-weight': 700, fill: '#5b6478' });
    txt(208, 26, 'out of the house', { 'font-size': 20, 'font-weight': 700, fill: '#3d7f8c' });
    PLACES.forEach(p => { el('circle', { cx: p.x, cy: p.y, r: 40, fill: '#fff' });
      icon(p.x, p.y, 40, p.icon, p.home ? '#8a94a6' : '#2c7fb8'); });
    const gLink = el('g', {}), gPh = el('g', {});
    const slot = (pl, i) => { const a = (i * 45 - 90) * Math.PI / 180; return [PLACES[pl].x + 60 * Math.cos(a), PLACES[pl].y + 60 * Math.sin(a)]; };
    const phones = SCHED.map((s, i) => { const [x, y] = slot(s[0], i); return { fo: icon(x, y, 28, 'mobile-screen-button', '#253494', gPh), x, y }; });
    const clock = txt(630, 440, '', { 'font-size': 30, 'font-weight': 700, fill: '#222', 'text-anchor': 'end' });

    // ---------------------------------------------------------------- right top: the contact network
    const NX = 925, NY = 178, NR = 94, node = i => { const a = (i * 45 - 90) * Math.PI / 180; return [NX + NR * Math.cos(a), NY + NR * Math.sin(a)]; };
    txt(700, 30, 'who was near whom today', { 'font-size': 22, 'font-weight': 700, fill: '#222' });
    const gE = el('g', {}), edges = {};
    for (let i = 0; i < NP; i++) for (let j = i + 1; j < NP; j++) { const [a, b] = [node(i), node(j)];
      edges[i + ',' + j] = { w: 0, e: el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#253494', 'stroke-width': 0, 'stroke-linecap': 'round', opacity: 0.55 }, gE) }; }
    for (let i = 0; i < NP; i++) { const [x, y] = node(i); el('circle', { cx: x, cy: y, r: 19, fill: '#fff', stroke: '#c5cdd8', 'stroke-width': 2 }); icon(x, y, 24, 'mobile-screen-button', '#253494'); }

    // ---------------------------------------------------------------- right bottom: tables on the fly
    txt(700, 318, 'a fresh table for every place, every week', { 'font-size': 20, 'font-weight': 700, fill: '#222' });
    const ROWS = ['New York', 'Texas'], TZ = 42, TG = 16, TX = 830;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const tiles = [];
    ROWS.forEach((name, r) => { const y0 = 338 + r * (TZ + TG);
      txt(TX - 14, y0 + TZ / 2 + 7, name, { 'font-size': 20, fill: '#555', 'text-anchor': 'end' });
      for (let c = 0; c < 6; c++) { const g = el('g', { opacity: 0.4 }), x0 = TX + c * (TZ + TG);   // readable before it fills
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
          const v = Math.min(YLGNBU.length - 1, Math.floor((a === b ? 3.2 : 1.2) + rnd() * 3));
          el('rect', { x: x0 + b * TZ / 3, y: y0 + a * TZ / 3, width: TZ / 3 - 1, height: TZ / 3 - 1, fill: YLGNBU[v] }, g); }
        tiles.push(g); } });
    txt(TX, 452, 'week 1', { 'font-size': 20, fill: '#888' });
    txt(TX + 5 * (TZ + TG) + TZ, 452, 'week 6', { 'font-size': 20, fill: '#888', 'text-anchor': 'end' });
    container.innerHTML = ''; container.appendChild(svg);

    // ---------------------------------------------------------------- the day
    const dur = h => (h < 7 || h > 20) ? opt.night : opt.hour;
    const T = Array.from({ length: 25 }, (_, h) => 0); for (let h = 1; h <= 24; h++) T[h] = T[h - 1] + dur(h - 1);
    let t0 = null, raf = null, lastH = -1, days = 0;
    const fmt = h => h === 0 || h === 24 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h} am` : `${h - 12} pm`;
    function frame(t) {
      if (t0 === null) t0 = t;
      let e = t - t0;
      if (e > T[24] + opt.hold) { t0 = t; e = 0; lastH = -1; days++;
        Object.values(edges).forEach(d => { d.w = 0; d.e.setAttribute('stroke-width', 0); }); }
      const h = e >= T[24] ? 23 : Math.max(0, T.findIndex(v => v > e) - 1), f = Math.min(1, (e - T[h]) / (0.35 * dur(h)));
      clock.textContent = e > T[24] ? fmt(24) : fmt(h);
      if (e > T[24] && tiles[days % tiles.length].getAttribute('opacity') !== '1') tiles[days % tiles.length].setAttribute('opacity', 1);
      // move each phone from last hour's place to this hour's
      phones.forEach((p, i) => { const s = SCHED[i], from = slot(s[(h + 23) % 24], i), to = slot(s[h], i), u = h === 0 ? 1 : f * f * (3 - 2 * f);
        p.x = from[0] + (to[0] - from[0]) * u; p.y = from[1] + (to[1] - from[1]) * u;
        p.fo.setAttribute('x', p.x - 14); p.fo.setAttribute('y', p.y - 14); });
      // contacts: phones sharing a non-home place this hour, once they have arrived
      gLink.innerHTML = '';
      if (f >= 1 && e <= T[24]) for (let i = 0; i < NP; i++) for (let j = i + 1; j < NP; j++) {
        const pi = SCHED[i][h]; if (pi !== SCHED[j][h] || PLACES[pi].home) continue;
        el('line', { x1: phones[i].x, y1: phones[i].y, x2: phones[j].x, y2: phones[j].y, stroke: '#253494', 'stroke-width': 2.2, opacity: 0.5 }, gLink);
        if (h !== lastH) { const d = edges[i + ',' + j]; d.w++; d.e.setAttribute('stroke-width', Math.min(11, 1.5 + 1.1 * d.w)); }
      }
      if (f >= 1) lastH = h;
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; t0 = null; } };
  }
  window.startCopresence = start;
})();
