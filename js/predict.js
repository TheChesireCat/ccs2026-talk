// "Learn it from diaries, apply it to phones": the activity prior, as current work.
//
// Two columns, no arrows (Ankit's choice): "a day, from a diary or a phone" on the left, "the model's
// odds" on the right with a badge for where it learned them; each person's row sits on one faint band.
// The rows are three of the ledger's real respondents, their day strip beside the deployed model's output (js/predict-data.js, from
// figures/predict_data.py: the hwes cdc prior 11-04-b deploys). A dashed tick on every bar marks the
// baseline share, what we would guess knowing nothing about the day, so the shift is the message.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const PLACE = { home: ['house', '#253494'], work: ['briefcase', '#2c7fb8'], eat: ['pizza-slice', '#41b6c4'],
                  shop: ['bag-shopping', '#5fb8a6'], away: [null, '#dfe3e8'] };
  const AGES = ['young', 'middle', 'older'], GLAB = ['18 to 49', '50 to 64', '65 and over'], COL = { young: '#41b6c4', middle: '#2c7fb8', older: '#253494' };
  const SHOW = [0, 2, 3];                       // the 27-year-old worker, the 76-year-old at home, the 80-year-old on errands
  function start(container) {
    const L = window.LEDGER, P = window.PREDICT, W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; return fo; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z, href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);

    // ---------------------------------------------------------------- column headers, no arrows
    // The logic is carried by the two headers and by each row's band: a day on the left, the odds the
    // model gives that day on the right, and a badge saying where the model learned them.
    const DX = 16, BZ = 28, BG = 3, BARX = 620, BARW = 340, RY0 = 98, RH = 106;
    txt(DX, 26, 'A day', { 'font-size': 26, 'font-weight': 700, fill: '#222' });
    txt(DX + 78, 26, 'from a diary or a phone', { 'font-size': 20, fill: '#777' });
    txt(BARX - 40, 26, 'The model\u2019s guess', { 'font-size': 26, 'font-weight': 700, fill: '#222' });
    txt(BARX + 184, 26, 'multinomial logit, 52 features', { 'font-size': 20, fill: '#777' });
    el('rect', { x: BARX - 40, y: 40, width: 330, height: 36, rx: 18, fill: '#e8f1f8' });
    icon(BARX - 16, 58, 22, 'clipboard-list', '#2c7fb8');
    txt(BARX + 2, 65, 'learned from 23,643 diary days', { 'font-size': 20, fill: '#2c7fb8' });

    // ---------------------------------------------------------------- three real days and their odds
    const grow = [];
    SHOW.forEach((k, r) => {
      const row = L.rows[k], pr = P.rows[k], y0 = RY0 + r * RH;
      el('rect', { x: 0, y: y0 - 10, width: BARX + BARW + 80, height: RH - 4, rx: 14, fill: '#f6f8fa' });   // 12px clear above the first bar and below the last
      txt(DX, y0 + 24, `${row.age} years old`, { 'font-size': 20, fill: '#777' });
      row.day.forEach((pl, i) => { const [ic, c] = PLACE[pl], x = DX + i * (BZ + BG);
        el('rect', { x, y: y0 + 38, width: BZ, height: BZ, rx: 5, fill: c }); if (ic) icon(x + BZ / 2, y0 + 38 + BZ / 2, 16, ic, '#fff'); });
      AGES.forEach((age, a) => { const y = y0 + 2 + a * 28;
        face(BARX - 22, y + 11, 26, { age, style: a % 2, skin: a, ring: true });
        el('rect', { x: BARX, y, width: BARW, height: 22, rx: 4, fill: '#e6eaf0' });
        const b = el('rect', { x: BARX, y, width: 0, height: 22, rx: 4, fill: COL[age] });
        const bx = BARX + BARW * P.marginal[a];
        el('path', { d: `M${bx},${y - 3} V${y + 25}`, stroke: '#444', 'stroke-width': 2, 'stroke-dasharray': '3 3' });
        const lab = txt(BARX + BARW + 12, y + 18, '', { 'font-size': 20, fill: '#444' });
        grow.push({ b, lab, v: pr.p[a], r }); });
    });
    txt(BARX, RY0 + 3 * RH + 16, 'dashed: the guess knowing nothing about the day', { 'font-size': 20, fill: '#777' });
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = container.dataset.static ? t - 1e6 : t;   // data-static: open on the finished picture
      const e = t - t0;
      grow.forEach(g => { const u = Math.max(0, Math.min(1, (e - 500 - g.r * 700) / 700)), s = 1 - Math.pow(1 - u, 3);
        g.b.setAttribute('width', BARW * g.v * s); g.lab.textContent = u > 0 ? Math.round(g.v * s * 100) + '%' : ''; });
      raf = e < 3000 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startPredict = start;
})();
