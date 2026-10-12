// Collaborators: the title slide comes back, and on the click (step 1) each name in the author line turns
// into that person's photo, in author order: the photo starts small at the name and flies to its place
// in a row under the title while the line of names fades. The ring's colour is the affiliation (navy:
// Network Science Institute, Northeastern; teal: Indiana University), with a legend beneath.
// Names come from the section's own author line (.authors .au, data-photo and data-aff on each).
(function () {
  const AFF = { netsi: ['#253494', 'Network Science Institute, Northeastern University'], iu: ['#41b6c4', 'Indiana University'] };
  function start(container) {
    const sec = container.closest('section'), names = [...sec.querySelectorAll('.authors .au')], N = names.length;
    const SLOT = container.offsetWidth / N, P = 136;
    container.innerHTML = '';
    const photos = names.map((nm, k) => {
      const d = document.createElement('div'); d.className = 'au-photo';
      d.style.left = (k * SLOT + SLOT / 2 - P / 2) + 'px';
      const [c] = AFF[nm.dataset.aff], parts = nm.textContent.trim().split(' '), last = parts.pop();
      d.innerHTML = `<img src="img/people/${nm.dataset.photo}.jpg" alt="${nm.textContent.trim()}" style="border-color:${c}"><span>${parts.join(' ')}<br>${last}</span>`;
      container.appendChild(d); return d; });
    const leg = document.createElement('div'); leg.className = 'au-legend';
    leg.innerHTML = Object.values(AFF).map(([c, s]) => `<span><i style="border-color:${c}"></i>${s}</span>`).join('');
    container.appendChild(leg);
    let n = 0;
    function show(k, animate) {
      sec.classList.toggle('people-shown', k >= 1);
      photos.forEach((d, i) => {
        if (k < 1) { d.style.transition = 'none'; d.style.opacity = 0; return; }
        if (!animate) { d.style.transition = 'none'; d.style.transform = 'none'; d.style.opacity = 1; return; }
        const r = names[i].getBoundingClientRect(), c = container.getBoundingClientRect(), s = c.width / container.offsetWidth;
        const dx = (r.left + r.width / 2 - c.left) / s - (parseFloat(d.style.left) + P / 2), dy = (r.top + r.height / 2 - c.top) / s - P / 2;
        d.style.transition = 'none'; d.style.transform = `translate(${dx}px,${dy}px) scale(0.18)`; d.style.opacity = 0;
        void d.offsetWidth;                                                 // commit the start position
        d.style.transition = `transform 0.9s cubic-bezier(.2,.7,.2,1) ${i * 0.16}s, opacity 0.35s ${i * 0.16}s`;
        d.style.transform = 'none'; d.style.opacity = 1; });
      leg.style.transition = animate ? `opacity 0.5s ${N * 0.16 + 0.6}s` : 'none'; leg.style.opacity = k >= 1 ? 1 : 0;
    }
    show(0, false);
    return { play() {}, pause() {}, step(k) { show(k, k === n + 1); n = k; } };
  }
  window.startAuthors = start;
})();
