// Null 2, "census commuting, no phones", for race: assume people meet where they commute. The US outline
// (js/usmap-data.js) with the 3,000 busiest county-to-county commutes from the ACS 2016-2020 flows
// (js/commute-data.js), each line as wide as its workers. In the null, every commute is contact
// opportunity between the two counties, and both ends are labelled by their census mix, exactly as the
// phones are; the score against the survey is 0.88 (js/promote-data.js). The busiest commutes draw in
// first, then the count of commuters, the null's own table (js/nulls-data.js), then the score.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function start(container) {
    const U = window.USMAP, C = window.COMMUTE, W = 1150, H = 455, S = 0.6, OX = 0, OY = 52;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };

    const gMap = el('g', { transform: `translate(${OX},${OY}) scale(${S})` });
    el('path', { d: U.nation, fill: '#f4f6f9', stroke: '#c9d1dc', 'stroke-width': 1.6 }, gMap);
    if (U.states) el('path', { d: U.states, fill: 'none', stroke: '#dde3ea', 'stroke-width': 1 }, gMap);
    const wmax = C.flows[0][4], lines = C.flows.map(([x1, y1, x2, y2, w], i) =>
      el('line', { x1, y1, x2, y2, stroke: '#253494', 'stroke-width': (0.9 + 5.5 * Math.sqrt(w / wmax)) / S * 0.6, 'stroke-linecap': 'round', opacity: 0 }, gMap));
    const gA = el('g', { opacity: 0 });
    txt(10, 24, Math.round((C.inter + C.intra) / 1e6) + ' million commutes to work, ' + Math.round(C.inter / 1e6) + ' million across county lines',
        { 'font-size': 20, fill: '#444' }, gA);
    // the null's own table (js/nulls-data.js), exactly as scored, on the race slides' shared log scale
    const R = window.RESULTS.race, T = window.NULLS.outer, YL = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
    const pos = R.ours.flat().concat(R.survey.flat()).filter(v => v > 0).sort((a, b) => a - b);
    const lo = Math.log(pos[Math.floor(0.01 * pos.length)]), hi = Math.log(pos[pos.length - 1]);
    const ramp = u => { const k = Math.max(0, Math.min(1, u)) * (YL.length - 1), i = Math.min(YL.length - 2, Math.floor(k)), f = k - i;
      const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YL[i]), b = p(YL[i + 1]);
      return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
    const SH = ['White', 'Hisp.', 'Black', 'Asian', 'Other'], TX = 826, TY = 72, TZ = 42, gT = el('g', { opacity: 0 });
    txt(TX + 2.5 * TZ, TY - 14, 'the table it gives', { 'font-size': 20, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' }, gT);
    T.forEach((row, a) => { txt(TX - 8, TY + a * TZ + TZ / 2 + 6, SH[a], { 'font-size': 16, fill: '#555', 'text-anchor': 'end' }, gT);
      row.forEach((v, b) => el('rect', { x: TX + b * TZ, y: TY + a * TZ, width: TZ - 2, height: TZ - 2, rx: 3, fill: ramp((Math.log(v) - lo) / (hi - lo)) }, gT)); });
    SH.forEach((l, b) => txt(TX + b * TZ + TZ / 2, TY + 5 * TZ + 18, l, { 'font-size': 15, fill: '#555', 'text-anchor': 'middle' }, gT));
    const gB = el('g', { opacity: 0 }), big = txt(TX - 50, 392, '', { 'font-size': 84, 'font-weight': 700, fill: '#9aa4b2' }, gB);
    txt(TX - 50, 420, 'match with the survey', { 'font-size': 22, fill: '#444' }, gB);
    txt(TX - 50, 445, 'census commutes and labels, no phones', { 'font-size': 18, fill: '#777' }, gB);
    container.innerHTML = ''; container.appendChild(svg);

    let t0 = null, raf = null;
    const cl = u => Math.max(0, Math.min(1, u));
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = t - t0, k = Math.floor(lines.length * cl((e - 300) / 2600));
      lines.forEach((l, i) => l.setAttribute('opacity', i < k ? 0.7 : 0));
      gA.setAttribute('opacity', cl((e - 1800) / 500)); gT.setAttribute('opacity', cl((e - 2500) / 500)); gB.setAttribute('opacity', cl((e - 3200) / 400));
      const u = cl((e - 3300) / 900); big.textContent = (window.NULLS.logr.outer * (1 - Math.pow(1 - u, 3))).toFixed(2);
      raf = e < 4400 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startCommuteMap = start;
})();
