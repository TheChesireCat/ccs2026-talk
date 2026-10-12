// Flat face avatars for the talk, after the reference sketch: young (dark hair), middle-aged
// (greying), older (white hair and glasses), two hair styles each. One function, used by every
// slide and by the live epidemic, so the faces are identical everywhere.
//
//   avatar({ age: 'young' | 'middle' | 'older', style: 0 | 1, state: 'S' | 'I' | 'R',
//            skin: 0..3, ring: true, generic: false }) -> SVG string, viewBox 0 0 100 100
//   generic: true draws an ageless, colourless person (only the ring shows the state).
//
// Age is carried by the face itself and by the ring colour (the group colours of the deck).
// State only changes the ring: susceptible = group colour, infected = the one warm accent,
// recovered = grey. Skin tone is decorative and never encodes data.
(function () {
  const GROUP = { young: '#41b6c4', middle: '#2c7fb8', older: '#253494' };
  const STATE = { I: '#e8590c', R: '#c9c9c9' };
  const SKIN = ['#f6a998', '#e3a07f', '#c08060', '#8d5a3e'];
  const HAIR = { young: '#1f1f1f', middle: '#2e2e2e', older: '#e3e3e3' };

  // hair shapes drawn behind (back) and over (front) the face
  const SHAPES = {
    short: { // short crop, after the top-left face
      back: '',
      front: 'M25 50 C23 30 36 20 51 20 C67 20 79 31 76 50 C73 41 66 35 52 35 C41 35 33 38 29 46 Z',
    },
    bob: {   // bob framing the face, after the bottom-left face
      back: 'M21 74 C14 42 29 19 50 19 C71 19 86 42 79 74 Z',
      front: 'M24 52 C24 31 37 21 51 21 C66 21 78 31 77 52 C72 42 62 34 50 34 C40 36 30 43 24 52 Z',
    },
    bald: {  // receding, side tufts only, after the top-right face
      back: '',
      front: 'M24 54 C22 42 27 34 33 32 C30 38 30 46 31 54 Z M76 54 C78 42 73 34 67 32 C70 38 70 46 69 54 Z M38 27 C44 23 56 23 62 27 C56 26 44 26 38 27 Z',
    },
  };

  // generic person: no age, no skin tone, one neutral grey; only the ring shows the SIR state
  function generic(o) {
    const st = o.state || 'S', ring = st === 'I' ? '#e8590c' : st === 'R' ? '#d4d4d4' : '#9aa4b2';
    const fill = st === 'R' ? '#c9ced6' : '#8a94a6';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      (o.ring !== false ? `<circle cx="50" cy="50" r="46" fill="#fff" stroke="${ring}" stroke-width="7"/>` : '') +
      `<circle cx="50" cy="38" r="15" fill="${fill}"/><path d="M24 80 C24 62 36 55 50 55 C64 55 76 62 76 80 Z" fill="${fill}"/></svg>`;
  }

  function avatar(o) {
    if (o.generic) return generic(o);
    const age = o.age || 'young', style = o.style || 0, state = o.state || 'S';
    const skin = SKIN[(o.skin == null ? 0 : o.skin) % SKIN.length];
    const ringCol = state === 'S' ? GROUP[age] : STATE[state];
    const shape = age === 'older' ? (style ? SHAPES.bob : SHAPES.bald) : (style ? SHAPES.bob : SHAPES.short);
    const hair = HAIR[age];
    const fade = state === 'R' ? ' opacity="0.45"' : '';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`;
    if (o.ring !== false) s += `<circle cx="50" cy="50" r="46" fill="#fff" stroke="${ringCol}" stroke-width="7"/>`;
    s += `<g${fade}>`;
    if (shape.back) s += `<path d="${shape.back}" fill="${hair}"/>`;
    s += `<circle cx="27" cy="55" r="6.5" fill="${skin}"/><circle cx="73" cy="55" r="6.5" fill="${skin}"/>`;
    s += `<circle cx="50" cy="54" r="24" fill="${skin}"/>`;
    s += `<path d="${shape.front}" fill="${hair}"/>`;
    if (age === 'middle') // the grey streak of the middle-aged faces
      s += `<path d="M${style ? '38 25 C44 26 50 31 53 36' : '56 22 C62 25 66 31 67 38'}" stroke="#cfcfcf" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    if (age === 'older') // glasses
      s += `<circle cx="41" cy="54" r="6.4" fill="none" stroke="#2a2a2a" stroke-width="2.2"/>` +
           `<circle cx="59" cy="54" r="6.4" fill="none" stroke="#2a2a2a" stroke-width="2.2"/>` +
           `<path d="M47.4 54 L52.6 54" stroke="#2a2a2a" stroke-width="2.2"/>`;
    s += `<circle cx="41" cy="54" r="2.2" fill="#1d1d1d"/><circle cx="59" cy="54" r="2.2" fill="#1d1d1d"/>`;
    s += `<path d="M44 63 Q50 67.5 56 63" stroke="#1d1d1d" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    if (state === 'I') // flushed cheeks while infected
      s += `<circle cx="35.5" cy="61" r="3.6" fill="#e8590c" opacity="0.55"/><circle cx="64.5" cy="61" r="3.6" fill="#e8590c" opacity="0.55"/>`;
    s += `</g></svg>`;
    return s;
  }
  window.avatar = avatar;
  window.AVATAR_GROUP = GROUP;
})();
