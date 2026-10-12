// "A survey sees 1,930 people. Phones see millions": a unit chart of the gap in scale.
//
// One square is 1,930 people, the whole Epistorm-Mix survey (two waves, May and October 2024, one
// diary day each). The phone panel over the same two windows (47 days) saw 3,622,728 devices with
// weekday data, 1,877 squares at the same size. The survey's one square sits on the left; the
// phone squares stream in column by column on the right while the counter runs up to the total.
// Then the cost of a survey fades in under it: the federal time-use survey (ATUS) costs $6,000,000
// a year for 8,520 diary days (OMB ICR 202512-1220-003), about $704 per person-day, and the money
// goes to recruiting, incentives, interviewers and months of fieldwork.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SURVEY = 1930, PHONES = 3622728, NSQ = Math.round(PHONES / SURVEY);   // 1,877
  function start(container, user) {
    const opt = Object.assign({ fill: 4200, delay: 500 }, user || {});
    const W = 1150, H = 455;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at)); t.textContent = s; return t; };
    const icon = (x, y, z, name, c) => { const fo = el('foreignObject', { x, y, width: z, height: z });
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };

    // the grid geometry, shared by both sides so a square means the same thing everywhere
    const GX = 372, GY = 200, COLS = 76, ROWS = Math.ceil(NSQ / COLS), P = Math.min((W - GX) / COLS, (H - GY - 6) / ROWS), S = P * 0.82;

    // left: the survey
    icon(0, 14, 56, 'clipboard-list', '#253494');
    txt(72, 56, 'Epistorm-Mix', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
    txt(0, 140, '1,930', { 'font-size': 84, 'font-weight': 700, fill: '#253494' });
    txt(0, 178, 'people, one diary day each', { 'font-size': 22, fill: '#555' });
    txt(0, 206, 'two waves, May and October 2024', { 'font-size': 20, fill: '#777' });
    const sx = 0, sy = 226;
    el('rect', { x: sx, y: sy, width: S, height: S, rx: 1.5, fill: '#253494' });
    el('path', { d: `M${sx + S + 6},${sy + S / 2} H${sx + 40}`, stroke: '#999', 'stroke-width': 1.5 });
    txt(sx + 48, sy + S / 2 + 7, 'the whole survey,', { 'font-size': 20, fill: '#555' });
    txt(sx + 48, sy + S / 2 + 33, 'one square', { 'font-size': 20, fill: '#555' });

    // left, second beat: what one diary day costs
    const gCost = el('g', { opacity: 0 });
    const t2 = (x, y, s, at) => { const t = txt(x, y, s, at); gCost.appendChild(t); return t; };
    const rule = el('line', { x1: 0, y1: 284, x2: 330, y2: 284, stroke: '#c5cdd8', 'stroke-width': 1.5 }); gCost.appendChild(rule);
    t2(0, 308, 'for scale, a different survey:', { 'font-size': 20, fill: '#777' });
    t2(0, 362, '$704', { 'font-size': 60, 'font-weight': 700, fill: '#253494' });
    t2(146, 338, 'per diary day in ATUS,', { 'font-size': 20, fill: '#555' });
    t2(146, 362, 'the US time-use survey', { 'font-size': 20, fill: '#555' });
    [['user-plus', 'recruit'], ['gift', 'pay'], ['person-walking', 'interview'], ['calendar-days', 'months']].forEach(([ic, lab], k) => {
      const cx = 22 + k * 86; icon(cx - 15, 384, 30, ic, '#8a94a6'); gCost.appendChild(svg.lastChild);
      t2(cx, 440, lab, { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' }); });

    // right: the phones
    icon(GX, 14, 56, 'mobile-screen-button', '#2c7fb8');
    txt(GX + 64, 56, 'Phones', { 'font-size': 30, 'font-weight': 700, fill: '#222' });
    const count = txt(GX, 140, '0', { 'font-size': 84, 'font-weight': 700, fill: '#2c7fb8' });
    txt(GX + 430, 108, 'devices over the', { 'font-size': 22, fill: '#555' });
    txt(GX + 430, 136, 'same 47 days', { 'font-size': 22, fill: '#555' });
    txt(GX + 430, 164, 'already powering', { 'font-size': 20, fill: '#777' });
    txt(GX + 430, 188, 'mobility.epistorm.org', { 'font-size': 20, 'font-weight': 700, fill: '#2c7fb8' });
    // squares fill column by column, so the panel reads as a stream arriving left to right
    const sq = [];
    for (let k = 0; k < NSQ; k++) { const c = Math.floor(k / ROWS), r = k % ROWS;
      sq.push(el('rect', { x: GX + c * P, y: GY + r * P, width: S, height: S, rx: 1.5, fill: '#2c7fb8', opacity: 0 })); }
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null, shown = 0;
    function frame(t) {
      if (t0 === null) t0 = t;
      const u = Math.max(0, Math.min(1, (t - t0 - opt.delay) / opt.fill)), e = 1 - Math.pow(1 - u, 2.2), n = Math.round(e * NSQ);
      for (; shown < n; shown++) sq[shown].setAttribute('opacity', 1);
      count.textContent = (u >= 1 ? PHONES : Math.round(e * PHONES)).toLocaleString('en-US');
      const c = Math.max(0, Math.min(1, (t - t0 - opt.delay - opt.fill - 500) / 700));
      gCost.setAttribute('opacity', c);
      raf = c < 1 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && gCost.getAttribute('opacity') !== '1') raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; t0 = null; } };
  }
  window.startScale = start;
})();
