// "Your day says something about your age": the activity ledger. Five real 2024 ATUS respondents
// (js/ledger-data.js, from figures/ledger_data.py), one row each, one filled box per clock hour from
// 7am to 8pm showing where they spent most of that hour. The boxes fill hour by hour like a clock,
// then each person's age appears. Colours and icons follow the design system's place vocabulary.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const PLACE = { home: ['house', '#253494'], work: ['briefcase', '#2c7fb8'], eat: ['pizza-slice', '#41b6c4'],
                  shop: ['bag-shopping', '#5fb8a6'], away: [null, '#dfe3e8'] };
  const group = a => a < 50 ? 'young' : a < 65 ? 'middle' : 'older';
  function start(container) {
    const D = window.LEDGER, W = 1150, H = 455, BX = 120, BZ = 50, BG = 6, RH = 66, RY = 46;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };
    const face = (x, y, z, o) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) });

    // hour ticks
    const hx = i => BX + i * (BZ + BG) + BZ / 2;
    [[0, '7am'], [5, 'noon'], [10, '5pm'], [13, '8pm']].forEach(([i, s]) => txt(hx(i), 26, s, { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' }));
    const cols = D.hours.map(() => []), ages = [];
    D.rows.forEach((r, k) => {
      const y = RY + k * RH;
      face(48, y + BZ / 2, 54, { age: group(r.age), style: k % 2, skin: (k + 1) % 4 });
      r.day.forEach((pl, i) => { const g = el('g', { opacity: 0 }), [ic, c] = PLACE[pl], x = BX + i * (BZ + BG);
        el('rect', { x, y, width: BZ, height: BZ, rx: 7, fill: c }, g);
        if (ic) icon(x + BZ / 2, y + BZ / 2, 26, ic, '#fff', g);
        cols[i].push(g); });
      const a = el('g', { opacity: 0 }), ax = BX + 14 * (BZ + BG) + 28;
      txt(ax, y + 38, r.age, { 'font-size': 40, 'font-weight': 700, fill: window.AVATAR_GROUP[group(r.age)] }, a);
      txt(ax + 52, y + 38, 'years old', { 'font-size': 20, fill: '#777' }, a);
      ages.push(a);
    });
    // legend
    [['home', 'home'], ['work', 'work'], ['eat', 'eating out'], ['shop', 'shopping']].forEach(([k, s], i) => {
      const x = BX + i * 200, y = RY + 5 * RH + 12, [ic, c] = PLACE[k];
      el('rect', { x, y, width: 30, height: 30, rx: 5, fill: c }); if (ic) icon(x + 15, y + 15, 17, ic, '#fff');
      txt(x + 40, y + 22, s, { 'font-size': 20, fill: '#555' }); });
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = t - t0;
      cols.forEach((c, i) => { const o = Math.max(0, Math.min(1, (e - 300 - i * 230) / 200)); c.forEach(g => g.setAttribute('opacity', o)); });
      ages.forEach((a, k) => a.setAttribute('opacity', Math.max(0, Math.min(1, (e - 3900 - k * 350) / 400))));
      raf = e < 6200 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startLedger = start;
})();
