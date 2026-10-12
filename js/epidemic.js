// A small live SIR epidemic on a contact network of face avatars, for the title slide.
//
// People sit in three loose neighbourhoods by age group, so most contacts are within a group:
// geography sorting who meets whom, which is the talk's whole subject. Each person is linked to
// their nearest neighbours plus a few long-range links. Every beat, each infected person passes
// infection along each link with probability P_INFECT, shown as an orange pulse travelling the
// link; infected people recover after a few beats. When the outbreak burns out the scene pauses
// and restarts from a new person. Deterministic layout (seeded), random outbreaks.
(function () {
  const W = 1280, H = 720;
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function layout(opt) {
    const r = rng(opt.seed);
    const groups = [
      { age: 'young',  cx: opt.cx[0], cy: opt.cy[0], n: opt.n[0] },
      { age: 'middle', cx: opt.cx[1], cy: opt.cy[1], n: opt.n[1] },
      { age: 'older',  cx: opt.cx[2], cy: opt.cy[2], n: opt.n[2] },
    ];
    const nodes = [];
    for (const g of groups) {
      let tries = 0;
      while (nodes.filter(d => d.age === g.age).length < g.n && tries++ < 5000) {
        const a = r() * 2 * Math.PI, rad = Math.sqrt(r()) * opt.spread;
        const x = g.cx + Math.cos(a) * rad * 1.25, y = g.cy + Math.sin(a) * rad * 0.85;
        if (x < opt.xmin || x > W - 30 || y < 40 || y > H - 40) continue;
        if (nodes.some(d => (d.x - x) ** 2 + (d.y - y) ** 2 < opt.gap ** 2)) continue;
        nodes.push({ x, y, age: g.age, style: Math.floor(r() * 2), skin: Math.floor(r() * 4) });
      }
    }
    const edges = new Set(), key = (i, j) => i < j ? i + ',' + j : j + ',' + i;
    nodes.forEach((d, i) => {
      nodes.map((e, j) => [j, (d.x - e.x) ** 2 + (d.y - e.y) ** 2]).filter(([j]) => j !== i)
           .sort((a, b) => a[1] - b[1]).slice(0, opt.k).forEach(([j]) => edges.add(key(i, j)));
    });
    for (let b = 0; b < opt.bridges; b++) {            // a few long-range contacts between groups
      const i = Math.floor(r() * nodes.length), j = Math.floor(r() * nodes.length);
      if (i !== j && nodes[i].age !== nodes[j].age) edges.add(key(i, j));
    }
    return { nodes, edges: [...edges].map(s => s.split(',').map(Number)) };
  }

  function start(container, user) {
    const opt = Object.assign({ seed: 7, n: [30, 22, 18], cx: [800, 1085, 905], cy: [205, 330, 545],
      spread: 175, gap: 54, k: 3, bridges: 9, size: 44, beat: 650, P_INFECT: 0.34,
      recover: [4, 7], xmin: 575, pause: 1800, labels: false, popScale: 1.28, popMs: 420 }, user || {});
    const { nodes, edges } = layout(opt);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    const gE = document.createElementNS(NS, 'g'), gP = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g');
    svg.append(gE, gP, gN); container.innerHTML = ''; container.appendChild(svg);
    const lines = edges.map(([i, j]) => {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', nodes[i].x); l.setAttribute('y1', nodes[i].y);
      l.setAttribute('x2', nodes[j].x); l.setAttribute('y2', nodes[j].y);
      l.setAttribute('stroke', '#d6dce4'); l.setAttribute('stroke-width', 2.2); gE.appendChild(l); return l;
    });
    // faint labels naming each neighbourhood's age group, placed just outside its faces
    const LABEL = { young: '18 to 49', middle: '50 to 64', older: '65 and over' };
    for (const age of (opt.labels ? ['young', 'middle', 'older'] : [])) {   // off on slide 1, by Ankit's call
      const ps = nodes.filter(d => d.age === age);
      const mx = ps.reduce((s, d) => s + d.x, 0) / ps.length;
      const y = age === 'older' ? Math.max(...ps.map(d => d.y)) + opt.size / 2 + 30
                                : Math.min(...ps.map(d => d.y)) - opt.size / 2 - 14;
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', Math.min(mx, W - 90)); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', avatarGroupColour(age)); t.setAttribute('opacity', '0.6');
      t.setAttribute('font-family', 'PT Sans, Helvetica, sans-serif'); t.setAttribute('font-size', '21');
      t.setAttribute('font-weight', '700'); t.textContent = LABEL[age]; gE.appendChild(t);
    }
    const nbr = nodes.map(() => []);
    edges.forEach(([i, j], e) => { nbr[i].push([j, e]); nbr[j].push([i, e]); });
    const cache = {}, img = (d, st) => {
      const k = d.age + d.style + d.skin + st;
      return cache[k] || (cache[k] = 'data:image/svg+xml;utf8,' + encodeURIComponent(avatar({ age: d.age, style: d.style, skin: d.skin, state: st })));
    };
    const ims = nodes.map(d => {
      const im = document.createElementNS(NS, 'image');
      im.setAttribute('x', d.x - opt.size / 2); im.setAttribute('y', d.y - opt.size / 2);
      im.setAttribute('width', opt.size); im.setAttribute('height', opt.size); gN.appendChild(im); return im;
    });
    let state, clock, timer = null, raf = null, pulses = [];
    const pops = new Map();   // face index -> time its infection packet landed
    const set = (i, st) => { state[i] = st; ims[i].setAttribute('href', img(nodes[i], st)); };
    function reset() {
      state = nodes.map(() => 'S'); clock = nodes.map(() => 0); nodes.forEach((_, i) => set(i, 'S'));
      lines.forEach(l => { l.setAttribute('stroke', '#d6dce4'); });
      const young = nodes.map((d, i) => d.age === 'young' ? i : -1).filter(i => i >= 0);
      const s = young[Math.floor(Math.random() * young.length)];
      set(s, 'I'); clock[s] = opt.recover[0] + Math.floor(Math.random() * (opt.recover[1] - opt.recover[0]));
    }
    function beat() {
      const now = [...state];
      now.forEach((st, i) => {
        if (st !== 'I') return;
        nbr[i].forEach(([j, e]) => {
          if (now[j] === 'S' && state[j] === 'S' && Math.random() < opt.P_INFECT) {
            state[j] = 'P';                             // infection in flight along the link
            pulses.push({ i, j, e, t0: performance.now() });
          }
        });
        if (--clock[i] <= 0) set(i, 'R');
      });
      if (!state.some(s => s === 'I' || s === 'P')) { stopBeat(); setTimeout(() => { reset(); startBeat(); }, opt.pause); }
    }
    function frame(t) {
      gP.innerHTML = '';
      pulses = pulses.filter(p => {
        const f = Math.min(1, (t - p.t0) / (opt.beat * 0.9));
        const a = nodes[p.i], b = nodes[p.j];
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', a.x + (b.x - a.x) * f); c.setAttribute('cy', a.y + (b.y - a.y) * f);
        c.setAttribute('r', 6.5); c.setAttribute('fill', '#e8590c'); gP.appendChild(c);
        lines[p.e].setAttribute('stroke', '#f2b28f');
        if (f >= 1) { set(p.j, 'I'); pops.set(p.j, t);   // the impact: the face swells as the packet lands
                      clock[p.j] = opt.recover[0] + Math.floor(Math.random() * (opt.recover[1] - opt.recover[0])); return false; }
        return true;
      });
      pops.forEach((t0, i) => {                    // swell to POP_SCALE and back, centred on the face
        const u = Math.min(1, (t - t0) / opt.popMs), s = 1 + (opt.popScale - 1) * Math.sin(Math.PI * u);
        const z = opt.size * s, d = nodes[i];
        ims[i].setAttribute('x', d.x - z / 2); ims[i].setAttribute('y', d.y - z / 2);
        ims[i].setAttribute('width', z); ims[i].setAttribute('height', z);
        if (u >= 1) pops.delete(i);
      });
      raf = requestAnimationFrame(frame);
    }
    const startBeat = () => { if (!timer) timer = setInterval(beat, opt.beat); };
    const stopBeat = () => { clearInterval(timer); timer = null; };
    reset();
    return {
      play() { startBeat(); if (!raf) raf = requestAnimationFrame(frame); },
      pause() { stopBeat(); cancelAnimationFrame(raf); raf = null; },
      nodes, edges,
    };
  }
  const avatarGroupColour = a => (window.AVATAR_GROUP || {})[a] || '#888';
  window.startEpidemic = start;
})();
