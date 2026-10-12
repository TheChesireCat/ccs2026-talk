// Slide 7, "Today they come from surveys": how Epistorm-Mix is built, how big it is, what diary
// surveys cost, and what contact surveys in general miss. Facts: Epistorm-Mix (Litvinova et al.,
// medRxiv 2025): probability-based online panel representative by age, sex, race/ethnicity, income,
// region and language; respondents list every contact from the previous day with the contact's age,
// sex, race/ethnicity and setting; two waves, May and October 2024; 1,930 respondents. Cost for scale:
// ATUS, $6,000,000 a year over 8,520 diary days (OMB ICR 202512-1220-003). Gaps: from the Epistorm-Mix
// and Fumanelli et al. introductions. Cards fade in one at a time.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  function start(container) {
    const W = 1150, H = 480;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };
    const groups = [];
    // three steps, numbered rather than joined by arrows
    [['user-plus', 'recruit a national sample', ['a probability panel, representative', 'by age, race, income and region']],
     ['clipboard-list', 'ask about yesterday', ['everyone you met: their age,', 'race, and where you met']],
     ['calendar-days', 'two waves, 2024', ['May and October,', 'one day per person']]].forEach(([ic, h, sub], k) => {
      const g = el('g', { opacity: 0 }), x = k * 385;
      el('rect', { x, y: 0, width: 360, height: 176, rx: 16, fill: '#f4f6f9' }, g);
      el('circle', { cx: x + 34, cy: 36, r: 18, fill: '#253494' }, g); txt(x + 34, 43, k + 1, { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }, g);
      icon(x + 92, 36, 40, ic, '#2c7fb8', g);
      txt(x + 24, 98, h, { 'font-size': 24, 'font-weight': 700, fill: '#222' }, g);
      sub.forEach((s, i) => txt(x + 24, 128 + i * 24, s, { 'font-size': 20, fill: '#666' }, g));
      groups.push(g); });
    // the size
    { const g = el('g', { opacity: 0 });
      txt(0, 300, '1,930', { 'font-size': 84, 'font-weight': 700, fill: '#253494' }, g);
      txt(0, 336, 'people in all', { 'font-size': 22, fill: '#555' }, g); groups.push(g); }
    // the cost, labelled as a different survey
    { const g = el('g', { opacity: 0 });
      txt(330, 250, 'for scale, a different survey:', { 'font-size': 20, fill: '#777' }, g);
      txt(330, 336, '$704', { 'font-size': 84, 'font-weight': 700, fill: '#253494' }, g);
      txt(330, 366, 'per diary day in ATUS,', { 'font-size': 20, fill: '#555' }, g);
      txt(330, 390, 'the US time-use survey', { 'font-size': 20, fill: '#555' }, g);
      [['user-plus', 'recruit'], ['gift', 'pay'], ['person-walking', 'interview'], ['calendar-days', 'months']].forEach(([ic, lab], k) => {
        const cx = 352 + k * 80; icon(cx, 424, 26, ic, '#8a94a6', g); txt(cx, 462, lab, { 'font-size': 20, fill: '#777', 'text-anchor': 'middle' }, g); });
      groups.push(g); }
    // what contact surveys miss, in general
    { const g = el('g', { opacity: 0 });
      el('rect', { x: 690, y: 220, width: 460, height: 250, rx: 16, fill: '#f4f6f9' }, g);
      txt(714, 258, 'contact surveys, in general:', { 'font-size': 22, 'font-weight': 700, fill: '#222' }, g);
      [['location-dot', 'only a few countries', '#2c7fb8'], ['users', 'rarely representative', '#2c7fb8'], ['virus', 'out of date after the pandemic', '#e8590c']].forEach(([ic, s, c], k) => {
        const y = 310 + k * 52; icon(736, y - 7, 30, ic, c, g); txt(766, y, s, { 'font-size': 22, fill: '#444' }, g); });
      groups.push(g); }
    container.innerHTML = ''; container.appendChild(svg);
    let t0 = null, raf = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      const e = t - t0;
      groups.forEach((g, i) => g.setAttribute('opacity', Math.max(0, Math.min(1, (e - 200 - i * 700) / 450))));
      raf = e < 5200 ? requestAnimationFrame(frame) : null;
    }
    return { play() { if (!raf && t0 === null) raf = requestAnimationFrame(frame); }, pause() {} };
  }
  window.startSurveys = start;
})();
