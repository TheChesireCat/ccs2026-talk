// "But a phone does not know your age": a device borrows its label from its home tract's census mix,
// and a contact between two devices is spread over every cell of the table.
//
// Left: two real Manhattan census tracts (ACS 5-year 2023, adults only), a younger one (tract 232:
// 65% aged 18 to 49, 26% 50 to 64, 9% 65 and over) and an older one (tract 155.02: 39%, 29%, 32%).
// Each tract's phone carries that mix as its label. The two phones go to the same restaurant and
// meet. Right: the contact lands in the table as the product of the two labels, nine shares that sum
// to one contact, shaded on the matrices' YlGnBu ramp.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'], COL = { young: '#41b6c4', middle: '#2c7fb8', older: '#253494' };
  const TRACTS = [{ name: 'a younger tract', p: [0.654, 0.258, 0.087] }, { name: 'an older tract', p: [0.386, 0.289, 0.3249] }];
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494'];
  function start(container, user) {
    const opt = Object.assign({ cycle: 12000 }, user || {});
    const W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };

    // ---------------------------------------------------------------- left: two tracts and their mix
    const TY = [20, 250], BX = 150, BW = 180;
    const homes = TRACTS.map((tr, k) => {
      const y0 = TY[k];
      el('rect', { x: 0, y: y0, width: 400, height: 190, rx: 16, fill: '#f4f6f9' });
      icon(48, y0 + 62, 46, 'house', '#8a94a6');
      txt(48, y0 + 112, 'home', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' });
      txt(BX - 50, y0 + 34, tr.name, { 'font-size': 22, 'font-weight': 700, fill: '#222' });
      tr.p.forEach((v, a) => { const y = y0 + 66 + a * 40;
        face(BX - 26, y, 32, { age: AGES[a], style: (a + k) % 2, skin: (a + 2 * k) % 4 });
        el('rect', { x: BX, y: y - 12, width: BW, height: 24, rx: 4, fill: '#e3e8ee' });
        el('rect', { x: BX, y: y - 12, width: BW * v, height: 24, rx: 4, fill: COL[AGES[a]] });
        txt(BX + BW + 12, y + 7, Math.round(v * 100) + '%', { 'font-size': 20, fill: '#444' }); });
      return [48, y0 + 150];
    });
    txt(200, 238, 'census mix of the home tract = the phone’s label', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' });

    // ---------------------------------------------------------------- middle: the restaurant
    const RX = 560, RY = 228;
    el('circle', { cx: RX, cy: RY, r: 46, fill: '#e8f1f8' }); icon(RX, RY, 46, 'pizza-slice', '#2c7fb8');
    const link = el('line', { x1: RX - 30, y1: RY - 70, x2: RX + 30, y2: RY - 70, stroke: '#253494', 'stroke-width': 3, opacity: 0 });
    const meet = txt(RX, RY + 82, 'they meet', { 'font-size': 22, 'font-weight': 700, fill: '#253494', 'text-anchor': 'middle', opacity: 0 });
    const ph = homes.map(() => icon(0, 0, 34, 'mobile-screen-button', '#253494'));
    const target = [[RX - 30, RY - 70], [RX + 30, RY - 70]];

    // ---------------------------------------------------------------- right: proportional mixing, as a mosaic
    // Rows are the younger tract's mix and columns the older tract's, drawn to scale, so every cell's
    // AREA is the product of its two shares: the definition of proportional mixing, without an equation.
    const GX = 836, GY = 76, SZ = 270, pa = TRACTS[0].p, pb = TRACTS[1].p;
    txt(GX + SZ / 2, 26, 'proportional mixing', { 'font-size': 24, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
    txt(GX + SZ / 2, 52, 'each cell\u2019s area: the two shares multiplied', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' });
    // rows stack from the bottom, so older sits at the top (deck-wide convention); top(a) is row a's upper edge
    const ry = [0], cx = [0], top = a => SZ - ry[a + 1];
    pa.forEach((v, a) => ry.push(ry[a] + v * SZ)); pb.forEach((v, b) => cx.push(cx[b] + v * SZ));
    const cells = [];
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      const v = pa[a] * pb[b], u = Math.min(1, Math.sqrt(v / 0.3)), k = Math.round(u * (YLGNBU.length - 1));
      const g = el('g', { opacity: 0 }), w = cx[b + 1] - cx[b], h = ry[a + 1] - ry[a];
      el('rect', { x: GX + cx[b] + 1.5, y: GY + top(a) + 1.5, width: w - 3, height: h - 3, rx: 4, fill: YLGNBU[k] }, g);
      if (w > 44 && h > 34) txt(GX + cx[b] + w / 2, GY + top(a) + h / 2 + 8, Math.round(v * 100) + '%', { 'font-size': 22, 'font-weight': 700, fill: k >= 5 ? '#fff' : '#222', 'text-anchor': 'middle' }, g);
      cells.push(g);
    }
    // the two mixes along the edges, in the group colours, with a face on every segment big enough
    AGES.forEach((age, a) => { const y0 = GY + top(a), h = ry[a + 1] - ry[a];
      el('rect', { x: GX - 16, y: y0 + 1.5, width: 10, height: h - 3, rx: 3, fill: COL[age] });
      face(GX - 40, y0 + h / 2, Math.min(36, Math.max(22, h - 6)), { age, style: a % 2, skin: a % 4 }); });
    AGES.forEach((age, b) => { const x0 = GX + cx[b], w = cx[b + 1] - cx[b];
      el('rect', { x: x0 + 1.5, y: GY + SZ + 6, width: w - 3, height: 10, rx: 3, fill: COL[age] });
      face(x0 + w / 2, GY + SZ + 40, 34, { age, style: (b + 1) % 2, skin: (b + 1) % 4 }); });
    txt(GX - 70, GY + SZ / 2, 'younger tract\u2019s phone', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle', transform: `rotate(-90 ${GX - 70} ${GY + SZ / 2})` });
    txt(GX + SZ / 2, GY + SZ + 84, 'older tract\u2019s phone', { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' });
    container.innerHTML = ''; container.appendChild(svg);

    // ---------------------------------------------------------------- the timeline
    const ease = u => u * u * (3 - 2 * u), cl = u => Math.max(0, Math.min(1, u));
    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      const END = 3800 + 9 * 260 + 300, e = Math.min(t - t0, END);         // plays once, then holds the finished picture
      const go = ease(cl((e - 1200) / 1800));                         // phones travel to the restaurant
      ph.forEach((fo, k) => { const [hx, hy] = homes[k], [tx, ty] = target[k], x = hx + 40 + (tx - hx - 40) * go, y = hy - 88 + (ty - hy + 88) * go;
        fo.setAttribute('x', x - 17); fo.setAttribute('y', y - 17); });
      const m = cl((e - 3100) / 400); link.setAttribute('opacity', m); meet.setAttribute('opacity', m);
      cells.forEach((g, i) => g.setAttribute('opacity', cl((e - 3800 - i * 260) / 300)));
      raf = e < END ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; t0 = null; } };
  }
  window.startBorrow = start;
})();
