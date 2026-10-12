// "But people do not mix at random": the compartments split by age group, coupled by who meets
// whom, and that coupling decomposed by setting.
//
// Left: one row of S / I / R compartments per age group. The curves between rows run from one
// group's infected box to another group's susceptible box, with thickness proportional to how
// often those groups meet (the survey's total contact matrix). Infection pulses travel the curves,
// chosen in proportion to their thickness.
// Right: the real Epistorm-Mix matrices by setting, home + school + work + community, summing to
// all contacts. Each pulse on the left lights up its cell in the total, so the table is visibly
// the thing that couples the compartments. Shared log colour scale (YlGnBu).
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AGES = ['young', 'middle', 'older'], GROUP = ['18 to 49', '50 to 64', '65 and over'];
  const YLGNBU = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  const col = v => { const lo = Math.log(0.05), hi = Math.log(4.2), u = Math.max(0, Math.min(1, (Math.log(Math.max(v, 0.05)) - lo) / (hi - lo)));
    const k = u * (YLGNBU.length - 1), i = Math.min(YLGNBU.length - 2, Math.floor(k)), f = k - i;
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16)), a = p(YLGNBU[i]), b = p(YLGNBU[i + 1]);
    return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`; };
  function start(container) {
    const S = window.SETTINGS, W = 1150, H = 540;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
    const txt = (x, y, s, at, p) => { const t = el('text', Object.assign({ x, y, 'font-family': 'PT Sans, Helvetica, sans-serif' }, at), p); t.textContent = s; return t; };
    const face = (x, y, z, o, p) => el('image', { x: x - z / 2, y: y - z / 2, width: z, height: z,
      href: 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar(o)) }, p);
    const icon = (x, y, z, name, c, p) => { const fo = el('foreignObject', { x: x - z / 2, y: y - z / 2, width: z, height: z }, p);
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${z}px;height:${z}px;background:${c};-webkit-mask:url(icons/${name}.svg) center/contain no-repeat;mask:url(icons/${name}.svg) center/contain no-repeat"></div>`; };

    // ------------------------------------------------------------ left: compartments by group
    // Coupling is drawn as an arc diagram between the groups' faces: contact happens between people,
    // so the arcs join the people, bulging left, thickness = how often the two groups meet (the
    // symmetrised total matrix), small loops = contact within a group. The S / I / R boxes sit to
    // the right, one row per group.
    const RY = [110, 270, 430], FX = 150, CHX = { S: 262, I: 362, R: 462 }, CW = 80, CHH = 56;
    const CC = { S: '#2c7fb8', I: '#e8590c', R: '#8a8a8a' };
    const T = S.Total, sym = (a, b) => (T[a][b] + T[b][a]) / 2, tmax = Math.max(...[0, 1, 2].flatMap(a => [0, 1, 2].map(b => sym(a, b))));
    const gL = el('g', {}), gP = el('g', {}), gC = el('g', {});
    const curves = [];
    for (let a = 0; a < 3; a++) for (let b = a; b < 3; b++) {
      const w = 2 + 15 * (sym(a, b) / tmax);
      const d = a === b
        ? `M${FX - 30},${RY[a] - 14} C${FX - 110},${RY[a] - 58} ${FX - 110},${RY[a] + 58} ${FX - 30},${RY[a] + 14}`
        : `M${FX - 32},${RY[a]} C${FX - 70 - 62 * (b - a)},${RY[a]} ${FX - 70 - 62 * (b - a)},${RY[b]} ${FX - 32},${RY[b]}`;
      const p = el('path', { d, fill: 'none', stroke: '#9cc3dd', 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0.6 }, gL);
      curves.push({ a, b, p, w: T[a][b], rev: false });
      if (a !== b) curves.push({ a: b, b: a, p, w: T[b][a], rev: true });
    }
    AGES.forEach((age, r) => {
      face(FX, RY[r], 62, { age, style: r % 2, skin: (r + 1) % 4 }, gC);
      txt(FX, RY[r] + 52, GROUP[r], { 'font-size': 18, fill: '#555', 'text-anchor': 'middle' }, gC);
      ['S', 'I', 'R'].forEach(k => {
        el('rect', { x: CHX[k] - CW / 2, y: RY[r] - CHH / 2, width: CW, height: CHH, rx: 12, fill: '#fff', stroke: CC[k], 'stroke-width': 3 }, gC);
        txt(CHX[k], RY[r] + 10, k, { 'font-size': 28, 'font-weight': 700, fill: CC[k], 'text-anchor': 'middle' }, gC);
      });
    });
    ['susceptible', 'infected', 'recovered'].forEach((s, k) => txt(Object.values(CHX)[k], 40, s, { 'font-size': 18, fill: '#777', 'text-anchor': 'middle' }));

    // ------------------------------------------------------------ right: settings sum to the total
    const small = 40, big = 74;
    const mat = (M, x0, y0, z, p) => M.map((row, a) => row.map((v, b) =>
      el('rect', { x: x0 + b * z, y: y0 + a * z, width: z - 2, height: z - 2, rx: 3, fill: col(v) }, p)));
    const SET = [['Household', 'house', 'home'], ['School', 'school', 'school'], ['Work', 'briefcase', 'work'], ['Other', 'users', 'community']];
    const sx0 = 560, sgap = 148;
    SET.forEach(([key, ic, name], k) => {
      const x0 = sx0 + k * sgap, y0 = 74;
      icon(x0 + 1.5 * small, 34, 38, ic, '#2c7fb8');
      mat(S[key], x0, y0, small);
      txt(x0 + 1.5 * small, y0 + 3 * small + 26, name, { 'font-size': 20, fill: '#444', 'text-anchor': 'middle' });
      if (k < 3) txt(x0 + 3 * small + 18, y0 + 1.5 * small + 10, '+', { 'font-size': 34, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle' });
    });
    const tx0 = 790, ty0 = 300;
    txt(tx0 - 92, ty0 + 1.5 * big + 12, '=', { 'font-size': 40, 'font-weight': 700, fill: '#888', 'text-anchor': 'middle' });
    const cells = mat(T, tx0, ty0, big);
    AGES.forEach((age, r) => { face(tx0 - 32, ty0 + r * big + big / 2, 44, { age, style: r % 2, skin: (r + 1) % 4 });
                               face(tx0 + r * big + big / 2, ty0 - 30, 44, { age, style: r % 2, skin: (r + 1) % 4 }); });
    txt(tx0 + 1.5 * big, ty0 + 3 * big + 34, 'all contacts', { 'font-size': 22, 'font-weight': 700, fill: '#222', 'text-anchor': 'middle' });
    const hi = el('rect', { width: big - 2, height: big - 2, rx: 4, fill: 'none', stroke: '#e8590c', 'stroke-width': 5, opacity: 0 });
    container.innerHTML = ''; container.appendChild(svg);

    // ------------------------------------------------------------ pulses, matched to their cell
    const tot = curves.reduce((s, c) => s + c.w, 0);
    let raf = null, last = 0, live = [];
    function frame(t) {
      if (t - last > 900) {                        // a new pulse, chosen in proportion to contact
        last = t; let u = Math.random() * tot, c = curves[0];
        for (const k of curves) { u -= k.w; if (u <= 0) { c = k; break; } }
        live.push({ c, t0: t });
        hi.setAttribute('x', tx0 + c.b * big); hi.setAttribute('y', ty0 + c.a * big);
      }
      gP.innerHTML = '';
      live = live.filter(v => { const f = (t - v.t0) / 1100; if (f >= 1) return false;
        const L = v.c.p.getTotalLength(), q = v.c.p.getPointAtLength((v.c.rev ? 1 - f : f) * L);
        el('circle', { cx: q.x, cy: q.y, r: 7, fill: '#e8590c' }, gP); return true; });
      const age = live.length ? (t - live[live.length - 1].t0) / 1100 : 1;
      hi.setAttribute('opacity', age < 1 ? 1 - age * 0.6 : 0);
      raf = requestAnimationFrame(frame);
    }
    return { play() { if (!raf) raf = requestAnimationFrame(frame); }, pause() { cancelAnimationFrame(raf); raf = null; } };
  }
  window.startMixing = start;
})();
