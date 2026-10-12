// Slide 9, "From phones to contacts": how the Epistorm mobility pipeline detects a contact, after the
// mobility.epistorm.org documentation. Stops (from Cuebiq, opted-in apps) are mapped to geohash cells
// of about 38 m x 19 m; two devices with stops in the same cell within overlapping 5-minute windows
// make a co-location, a contact. Left: two phones arrive, each leaves a stop, their stops land in the
// same cell, and a 5-minute timeline below shows the overlap lighting up as one contact. Right: the
// daily indicators the dashboard publishes from the same stops. Loops.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function start(container) {
    const W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };

    // ------------------------------------------------------------ the grid (geohash cells, 2:1)
    const GX = 20, GY = 20, CW = 110, CH = 55, NC = 5, NR = 4;
    const cells = [];
    for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++)
      cells.push(el('rect', { x: GX + c * CW, y: GY + r * CH, width: CW, height: CH, fill: '#f6f8fa', stroke: '#d6dce4', 'stroke-width': 1.5 }));
    txt(GX, GY + NR * CH + 26, 'one geohash cell: about 38 m by 19 m', { 'font-size': 20, fill: '#777' });
    const HC = 2, HR = 1, hot = cells[HR * NC + HC];                       // the shared cell
    const COL = { A: '#253494', B: '#41b6c4' };
    const path = { A: [[GX - 10, GY + 3.6 * CH], [GX + 2.4 * CW, GY + 1.45 * CH]], B: [[GX + NC * CW + 10, GY + 0.3 * CH], [GX + 2.65 * CW, GY + 1.6 * CH]] };
    const dev = {}, stop = {};
    ['A', 'B'].forEach(k => { stop[k] = el('circle', { cx: path[k][1][0], cy: path[k][1][1], r: 7, fill: COL[k], opacity: 0 });
      dev[k] = icon(path[k][0][0], path[k][0][1], 34, 'mobile-screen-button', COL[k]); });

    // ------------------------------------------------------------ the 5-minute timeline
    const TX = 90, TY = 330, TW = 460, BINS = 9, BW = TW / BINS;          // 12:00 to 12:45
    for (let b = 0; b < BINS; b++) el('rect', { x: TX + b * BW, y: TY - 8, width: BW - 2, height: 84, fill: '#f6f8fa' });
    [0, 3, 6, 9].forEach(b => txt(TX + b * BW, TY + 100, `12:${String(b * 5).padStart(2, '0')}`, { 'font-size': 18, fill: '#777', 'text-anchor': 'middle' }));
    txt(TX + TW / 2, TY + 126, '5-minute windows', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' });
    const over = [], SPAN = { A: [0, 5], B: [2, 8] };                   // A 12:00-12:25, B 12:10-12:40
    for (let b = 2; b < 5; b++) over.push(el('rect', { x: TX + b * BW, y: TY - 8, width: BW - 2, height: 84, fill: '#dbe6f3', opacity: 0 }));
    const bar = {};
    ['A', 'B'].forEach((k, i) => { const y = TY + 6 + i * 36;
      icon(TX - 30, y + 11, 24, 'mobile-screen-button', COL[k]);
      bar[k] = el('rect', { x: TX + SPAN[k][0] * BW, y, width: 0, height: 22, rx: 5, fill: COL[k] }); });
    const hit = el('g', { opacity: 0 });
    el('rect', { x: GX + HC * CW, y: GY + HR * CH, width: CW, height: CH, fill: 'none', stroke: '#222', 'stroke-width': 4 }, hit);
    el('rect', { x: GX + (HC + 1) * CW + 8, y: GY + HR * CH + 12, width: 112, height: 32, rx: 16, fill: '#222' }, hit);
    txt(GX + (HC + 1) * CW + 64, GY + HR * CH + 34, 'a contact', { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }, hit);

    // ------------------------------------------------------------ right: what is published
    const RX = 640;
    txt(RX, 40, 'published daily at', { 'font-size': 20, fill: '#777' });
    txt(RX, 68, 'mobility.epistorm.org', { 'font-size': 26, 'font-weight': 700, fill: '#2c7fb8' });
    [['contact', [['users', 'distinct contacts'], ['clock', 'total time in contact'], ['hourglass-half', 'average contact length']]],
     ['movement', [['briefcase', 'commuting'], ['location-dot', 'how far people range'], ['plane', 'travel between metro areas']]]].forEach(([h, items], g) => {
      const y0 = 116 + g * 168;
      txt(RX, y0, h, { 'font-size': 22, 'font-weight': 700, fill: '#222' });
      items.forEach(([ic, s], k) => { const y = y0 + 38 + k * 40; icon(RX + 14, y - 7, 24, ic, '#2c7fb8'); txt(RX + 40, y, s, { 'font-size': 20, fill: '#444' }); }); });
    txt(RX, 462, 'from opted-in phones, across the US, every day', { 'font-size': 20, fill: '#777' });
    // centre the whole drawing on the slide: its content spans x 20 to 1028, so shift right by 51
    const all = document.createElementNS(NS, 'g'); all.setAttribute('transform', 'translate(51,0)');
    while (svg.firstChild) all.appendChild(svg.firstChild); svg.appendChild(all);
    container.innerHTML = ''; container.appendChild(svg);

    const ease = u => u * u * (3 - 2 * u), cl = u => Math.max(0, Math.min(1, u));
    const LOOP = 10500;
    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = (t - t0) % LOOP;
      [['A', 300], ['B', 2300]].forEach(([k, at]) => {
        const u = ease(cl((e - at) / 1300)), [p0, p1] = path[k];
        dev[k].setAttribute('x', p0[0] + (p1[0] - p0[0]) * u - 17); dev[k].setAttribute('y', p0[1] + (p1[1] - p0[1]) * u - 17 - 26 * cl(u * 3));
        stop[k].setAttribute('opacity', u >= 1 ? 1 : 0);
        const g = cl((e - at - 1300) / 1500);
        bar[k].setAttribute('width', Math.max(0, (SPAN[k][1] - SPAN[k][0]) * BW * g - 2));
      });
      const both = cl((e - 5300) / 500);
      hot.setAttribute('fill', both > 0 ? '#dbe6f3' : '#f6f8fa');
      over.forEach(o => o.setAttribute('opacity', both)); hit.setAttribute('opacity', both);
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) { t0 = null; raf = requestAnimationFrame(frame); } }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startGeohash = start;
})();
