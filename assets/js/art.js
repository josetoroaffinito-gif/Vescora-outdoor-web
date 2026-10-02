/*
 * VESCORA — Ilustraciones vectoriales.
 *
 * Escenas de paisaje y fotografías de producto provisionales generadas en SVG,
 * sin peso de imagen. Cuando exista fotografía real, basta con añadir `photo`
 * (ruta a .avif/.webp) al producto, técnica, especie o artículo: la interfaz
 * mostrará la fotografía en lugar de la ilustración.
 */
(function () {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  function rng(seed) {
    let a = 0;
    for (const ch of String(seed)) a = (a * 31 + ch.charCodeAt(0)) | 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Línea de crestas con ruido suave (suma de senos + jitter).
  function ridge(r, baseY, amp, step, W, H, sharp) {
    const f = [0.002 + r() * 0.002, 0.006 + r() * 0.004, 0.017 + r() * 0.01];
    const ph = [r() * 6, r() * 6, r() * 6];
    let d = `M0,${H} L0,${baseY}`;
    for (let x = 0; x <= W + step; x += step) {
      let n = Math.sin(x * f[0] + ph[0]) * 0.6 + Math.sin(x * f[1] + ph[1]) * 0.3 + Math.sin(x * f[2] + ph[2]) * 0.1;
      if (sharp) n = 1 - Math.abs(n) * 1.6;
      const y = baseY - amp * n - r() * amp * 0.06;
      d += ` L${x},${y.toFixed(1)}`;
    }
    return d + ` L${W},${H} Z`;
  }

  function pines(r, baseY, amp, W, color, count, size) {
    let d = '';
    for (let i = 0; i < count; i++) {
      const x = r() * W;
      const h = size * (0.6 + r() * 0.8);
      const y = baseY + r() * amp;
      const w = h * 0.28;
      d += `M${x.toFixed(1)},${(y - h).toFixed(1)} L${(x + w).toFixed(1)},${y.toFixed(1)} L${(x - w).toFixed(1)},${y.toFixed(1)} Z `;
    }
    return `<path d="${d}" fill="${color}"/>`;
  }

  function streaks(r, y0, y1, W, color, n, maxW) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = y0 + Math.pow(r(), 1.6) * (y1 - y0);
      const w = 20 + r() * maxW * (0.3 + (y - y0) / (y1 - y0));
      const x = r() * W;
      s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(1)}" width="${w.toFixed(0)}" height="${(1 + (y - y0) / (y1 - y0) * 3).toFixed(1)}" rx="2" fill="${color}" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`;
    }
    return s;
  }

  function angler(x, y, s, color, flip) {
    const t = `translate(${x},${y}) scale(${flip ? -s : s},${s})`;
    return `<g transform="${t}" fill="${color}">
      <path d="M-7,-84 C-11,-70 -12,-58 -10,-46 L-11,-24 L-13,0 L-6,0 L-3,-24 L0,-40 L3,-24 L5,0 L12,0 L8,-26 L8,-46 C9,-58 8,-72 5,-84 Z"/>
      <circle cx="-1" cy="-91" r="6.5"/>
      <path d="M-13,-95 Q0,-92 12,-95 L8,-98 L6,-104 Q0,-106 -6,-104 L-8,-98 Z"/>
      <path d="M3,-81 L15,-72 L19,-65 L15,-62 L3,-71 Z"/>
      <path d="M16,-64 Q58,-118 118,-150" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M118,-150 Q170,-110 205,4" fill="none" stroke="${color}" stroke-width=".6" opacity=".55"/>
    </g>`;
  }

  function boat(x, y, s, color) {
    return `<g transform="translate(${x},${y}) scale(${s})" fill="${color}">
      <path d="M-120,-6 Q-40,-18 130,-22 Q120,4 70,14 L-100,14 Q-124,8 -120,-6 Z"/>
      <path d="M-40,-18 L-40,-44 L-24,-44 L-22,-18 Z"/>
      <path d="M-6,-20 C-10,-34 -8,-50 0,-58 L10,-58 C16,-48 16,-34 14,-20 Z"/>
      <circle cx="5" cy="-65" r="6"/>
      <path d="M-7,-69 Q5,-66 17,-69 L12,-72 L11,-77 L0,-77 L-1,-72 Z"/>
      <path d="M12,-50 Q60,-100 120,-120" fill="none" stroke="${color}" stroke-width="1.6"/>
      <path d="M120,-120 Q160,-80 180,10" fill="none" stroke="${color}" stroke-width=".6" opacity=".5"/>
    </g>`;
  }

  const P = {
    dawn:   { sky: ['#232c36', '#6b6f73', '#d9b58b'], sun: '#f6ddb0', m: ['#737a82', '#555d66', '#39414a'], w: ['#8a8378', '#1f262c'], fg: '#121517', hz: 0.62 },
    coast:  { sky: ['#7f96a3', '#b9c2c0', '#eadcc0'], sun: '#fbeed2', m: ['#9aa6a6', '#76858a', '#4d5c61'], w: ['#8fa1a5', '#2a3a41'], fg: '#171c1e', hz: 0.6 },
    rock:   { sky: ['#8e9593', '#b9bbb3', '#dcd7c9'], sun: '#efe7d4', m: ['#8d9491', '#6b7472', '#4a5250'], w: ['#7c8a89', '#2f3b3c'], fg: '#15191a', hz: 0.56 },
    harbor: { sky: ['#1b2530', '#4e5560', '#c08d6c'], sun: '#f0c796', m: ['#4a525c', '#343c46', '#232a31'], w: ['#5c5a5a', '#141a20'], fg: '#0e1215', hz: 0.64 },
    river:  { sky: ['#aeb7ae', '#cfd2c6', '#ebe7d8'], sun: '#fbf4e2', m: ['#7f8c80', '#566457', '#34423a'], w: ['#aab5ae', '#4a5a54'], fg: '#1a211c', hz: 0.66, trees: true },
    forest: { sky: ['#9aa598', '#c8cbbd', '#e6e1cf'], sun: '#f7efd9', m: ['#6f7d6e', '#4b5a4c', '#2c382f'], w: ['#9aa69c', '#3b4a42'], fg: '#161c17', hz: 0.7, trees: true },
    night:  { sky: ['#0b1016', '#17212b', '#2f3b46'], sun: '#e8ecea', m: ['#26303a', '#1b242c', '#131a20'], w: ['#27323b', '#080b0e'], fg: '#06080a', hz: 0.62, moon: true },
    beach:  { sky: ['#a7b3b5', '#cdd1c9', '#efe5cf'], sun: '#fff5de', m: ['#a4aeac', '#8a9795', '#6a7877'], w: ['#8c9e9f', '#51656a'], fg: '#cbb994', hz: 0.55, sand: true },
    boat:   { sky: ['#6f8591', '#a6b1b0', '#e2d6bd'], sun: '#fbeccd', m: ['#879598', '#6c7b80', '#4e5d63'], w: ['#71868c', '#1f2d33'], fg: '#12181b', hz: 0.58 }
  };

  function scene(key, opts = {}) {
    const p = P[key] || P.coast;
    const r = rng(key + (opts.seed || ''));
    const W = 1600, H = 1000, hz = Math.round(H * p.hz);
    const g = id('g'), wg = id('w'), sg = id('s'), fog = id('f');
    const sunX = opts.sunX || (key === 'harbor' ? 1080 : key === 'night' ? 1180 : 520 + r() * 600);
    const sunY = key === 'night' ? hz - 330 : hz - 30 - r() * 60;
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.label || 'Ilustración de paisaje'}">
    <defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
      <linearGradient id="${wg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.w[0]}"/><stop offset="1" stop-color="${p.w[1]}"/></linearGradient>
      <radialGradient id="${sg}"><stop offset="0" stop-color="${p.sun}" stop-opacity=".95"/><stop offset=".12" stop-color="${p.sun}" stop-opacity=".7"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${fog}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[2]}" stop-opacity="0"/><stop offset=".7" stop-color="${p.sky[2]}" stop-opacity=".55"/><stop offset="1" stop-color="${p.sky[2]}" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${g})"/>
    <circle cx="${sunX}" cy="${sunY}" r="${key === 'night' ? 260 : 520}" fill="url(#${sg})"/>
    <circle cx="${sunX}" cy="${sunY}" r="${key === 'night' ? 34 : 46}" fill="${p.sun}" opacity="${key === 'night' ? 0.95 : 0.9}"/>`;
    if (key === 'night') {
      for (let i = 0; i < 70; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * hz * 0.7).toFixed(0)}" r="${(r() * 1.6 + 0.3).toFixed(1)}" fill="#fff" opacity="${(0.2 + r() * 0.6).toFixed(2)}"/>`;
    }
    // Montañas en capas con perspectiva atmosférica
    s += `<path d="${ridge(r, hz - 150, 170, 16, W, hz + 2, true)}" fill="${p.m[0]}" opacity=".75"/>`;
    s += `<rect x="0" y="${hz - 200}" width="${W}" height="220" fill="url(#${fog})"/>`;
    s += `<path d="${ridge(r, hz - 60, 110, 14, W, hz + 2, key !== 'beach')}" fill="${p.m[1]}"/>`;
    if (p.trees) s += pines(r, hz - 70, 70, W, p.m[2], 260, 46);
    s += `<path d="${ridge(r, hz - 10, 40, 12, W, hz + 2)}" fill="${p.m[2]}"/>`;
    // Agua
    s += `<rect x="0" y="${hz}" width="${W}" height="${H - hz}" fill="url(#${wg})"/>`;
    s += streaks(r, hz + 4, H, W, p.sun, key === 'night' ? 40 : 90, 260);
    // Reflejo del sol / luna
    for (let i = 0; i < 26; i++) {
      const y = hz + 6 + i * i * 0.7;
      const w = 30 + i * 9 + r() * 40;
      s += `<rect x="${(sunX - w / 2 + (r() - 0.5) * 30).toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(2 + i * 0.25).toFixed(1)}" rx="2" fill="${p.sun}" opacity="${(0.55 - i * 0.018).toFixed(2)}"/>`;
    }
    // Primer plano según escena
    if (key === 'harbor' || key === 'night') {
      const by = hz + 60;
      s += `<path d="M0,${by} L980,${by - 18} L1010,${by - 30} L1030,${by - 30} L1040,${by - 18} L1060,${by - 18} L1060,${by + 20} L0,${by + 40} Z" fill="${p.fg}"/>`;
      s += `<rect x="1012" y="${by - 120}" width="16" height="92" fill="${p.fg}"/><rect x="1008" y="${by - 128}" width="24" height="10" fill="${p.fg}"/><circle cx="1020" cy="${by - 136}" r="7" fill="${p.sun}"/>`;
      for (let i = 0; i < 9; i++) {
        const x = 90 + i * 105;
        s += `<rect x="${x}" y="${by - 64}" width="3" height="50" fill="${p.fg}"/><circle cx="${x + 1.5}" cy="${by - 66}" r="3.5" fill="#f5d7a6"/><circle cx="${x + 1.5}" cy="${by - 66}" r="16" fill="#f5d7a6" opacity=".12"/>`;
        s += `<rect x="${x - 6}" y="${by + 50 + r() * 30}" width="${14 + r() * 10}" height="2" fill="#f5d7a6" opacity=".35"/>`;
      }
      s += angler(760, by - 20, 1.05, p.fg);
      s += `<path d="M0,${H} L0,${H - 70} C300,${H - 90} 500,${H - 60} 800,${H - 76} C1100,${H - 92} 1300,${H - 70} 1600,${H - 84} L1600,${H} Z" fill="${p.fg}"/>`;
    } else if (key === 'beach') {
      s += `<path d="M0,${H} L0,${hz + 190} C400,${hz + 160} 900,${hz + 200} 1600,${hz + 170} L1600,${H} Z" fill="${p.fg}"/>`;
      s += `<path d="M0,${hz + 186} C400,${hz + 156} 900,${hz + 196} 1600,${hz + 166}" stroke="#f3ecdc" stroke-width="5" fill="none" opacity=".8"/>`;
      [[980, 1.0], [1120, 0.92]].forEach(([x, k]) => {
        s += `<g stroke="#2a2f31" stroke-linecap="round" fill="none"><path d="M${x},${hz + 300} L${x + 20},${hz + 150}" stroke-width="5"/><path d="M${x + 12},${hz + 210} Q${x + 80},${hz - 120 * k} ${x + 150},${hz - 330 * k}" stroke-width="3"/><path d="M${x + 150},${hz - 330 * k} Q${x - 200},${hz - 100} ${x - 500},${hz + 20}" stroke-width=".6" opacity=".5"/></g>`;
      });
      s += angler(700, hz + 250, 1.3, '#2a2f31');
    } else if (key === 'boat') {
      s += boat(820, hz + 170, 1.6, p.fg);
      s += streaks(r, hz + 190, hz + 230, W, p.fg, 12, 200);
    } else if (key === 'river' || key === 'forest') {
      s += pines(r, H - 180, 120, W, p.fg, 60, 230);
      s += `<path d="M0,${H} L0,${H - 110} C260,${H - 150} 420,${H - 90} 620,${H - 120} C820,${H - 150} 1000,${H - 60} 1600,${H - 130} L1600,${H} Z" fill="${p.fg}"/>`;
      if (key === 'river') s += angler(1120, H - 128, 1.4, p.fg, true);
    } else {
      // costa / roca / amanecer: bloques de roca y pescador
      const big = key === 'rock';
      s += `<path d="M0,${H} L0,${H - (big ? 330 : 240)} L90,${H - (big ? 360 : 262)} L210,${H - (big ? 330 : 250)} L330,${H - (big ? 280 : 215)} L420,${H - (big ? 290 : 220)} L560,${H - (big ? 210 : 170)} L720,${H - 150} L900,${H - 120} L1600,${H - 90} L1600,${H} Z" fill="${p.fg}"/>`;
      s += `<path d="M1180,${H - 90} L1260,${H - 140} L1360,${H - 150} L1450,${H - 120} L1600,${H - 130} L1600,${H} L1180,${H} Z" fill="${p.fg}"/>`;
      s += angler(big ? 250 : 200, H - (big ? 346 : 258), big ? 1.9 : 1.6, p.fg);
      s += `<path d="M560,${H - 172} Q640,${H - 188} 720,${H - 156}" stroke="${p.sun}" stroke-width="3" fill="none" opacity=".35"/>`;
    }
    if (opts.flip) s = s.replace(/(<\/defs>)/, '$1<g transform="translate(1600 0) scale(-1 1)">') + '</g>';
    return s + '</svg>';
  }

  // ——— Producto ——————————————————————————————————————————————

  function wrap(inner, label, defs = '') {
    const sh = id('sh');
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><defs>${defs}<radialGradient id="${sh}"><stop offset="0" stop-color="#1b1d1e" stop-opacity=".22"/><stop offset="1" stop-color="#1b1d1e" stop-opacity="0"/></radialGradient></defs><ellipse cx="400" cy="492" rx="300" ry="26" fill="url(#${sh})"/>${inner}</svg>`;
  }
  const lin = (gid, stops, vertical = true) => `<linearGradient id="${gid}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e9e3cf"/><circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="#15181a"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.3}" r="${r * 0.18}" fill="#fff"/>`;
  const treble = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="#3b4045" stroke-width="3.2" stroke-linecap="round"><circle cx="0" cy="0" r="7"/><path d="M0,7 L0,52"/><path d="M0,52 C0,74 -26,74 -26,52 L-24,44"/><path d="M0,52 C0,74 26,74 26,52 L24,44"/><path d="M0,52 C8,70 20,66 18,56"/></g>`;

  const draw = {
    softbait(c, o, L) {
      const a = id('a');
      const k = o.big ? 1.12 : 1, d = o.big ? 1.25 : 1;
      let ribs = '';
      for (let x = 300; x <= 470; x += 18) ribs += `<path d="M${x},${300 - 44 * d + (x - 300) * 0.1} Q${x + 6},300 ${x},${300 + 44 * d - (x - 300) * 0.1}" stroke="#000" stroke-opacity=".08" stroke-width="2" fill="none"/>`;
      return wrap(`<g transform="translate(${400 - 400 * k},${300 - 300 * k}) scale(${k})">
        <path d="M150,300 C150,${300 - 52 * d} 205,${300 - 62 * d} 270,${300 - 58 * d} L470,${300 - 36 * d} C505,${300 - 30 * d} 530,292 560,294 L592,296 L592,304 L560,306 C530,308 505,${300 + 30 * d} 470,${300 + 36 * d} L270,${300 + 58 * d} C205,${300 + 62 * d} 150,${300 + 52 * d} 150,300 Z" fill="url(#${a})"/>
        ${ribs}
        <ellipse cx="612" cy="300" rx="20" ry="${50 * d}" fill="url(#${a})"/>
        <path d="M170,${300 - 30 * d} Q300,${300 - 70 * d} 470,${300 - 40 * d}" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>
        ${eye(196, 292 - 8 * d, 11)}
      </g>`, L, lin(a, [c[0], c[0], c[1]]));
    },
    shad(c, o, L) { return draw.softbait(c, { big: true }, L); },
    pintail(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M170,300 C170,272 210,266 260,268 L480,284 C540,290 600,296 660,286 C690,282 700,290 690,298 C640,312 560,312 480,316 L260,332 C210,334 170,328 170,300 Z" fill="url(#${a})" opacity=".92"/>
        <path d="M190,284 Q320,262 480,290" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>${eye(200, 294, 8)}`, L, lin(a, [c[0], c[1]]));
    },
    minnow(c, o, L) {
      const a = id('a'), lp = id('l');
      let stripes = '';
      if (o.stripes) for (let x = 280; x < 560; x += 36) stripes += `<path d="M${x},248 Q${x + 14},272 ${x + 4},292" stroke="#1f2a22" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55"/>`;
      return wrap(`<path d="M184,318 L112,372 Q118,384 132,380 L214,334 Z" fill="url(#${lp})"/>
        <path d="M180,300 C180,255 260,238 360,240 C470,242 560,262 612,290 C618,300 612,308 602,312 C540,340 460,352 360,352 C260,352 180,340 180,300 Z" fill="url(#${a})"/>
        ${stripes}
        <path d="M200,276 Q360,236 590,284" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none"/>
        <path d="M262,262 Q248,300 266,338" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none"/>
        ${eye(226, 286, 16)}
        <circle cx="614" cy="300" r="6" fill="none" stroke="#3b4045" stroke-width="3"/>
        ${treble(340, 352)}${treble(500, 342)}`, L, lin(a, [c[0], c[0], c[1], c[1]]) + lin(lp, ['#dfe6ea', '#9fb2bd']));
    },
    walker(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M160,300 C160,268 230,256 380,256 C520,256 604,272 636,300 C604,328 520,344 380,344 C230,344 160,332 160,300 Z" fill="url(#${a})"/>
        <path d="M190,280 Q380,250 610,290" stroke="#fff" stroke-opacity=".6" stroke-width="5" fill="none"/>
        <path d="M250,262 Q238,300 252,338" stroke="#000" stroke-opacity=".12" stroke-width="3" fill="none"/>
        ${eye(208, 290, 13)}<circle cx="150" cy="300" r="6" fill="none" stroke="#3b4045" stroke-width="3"/>
        ${treble(360, 344)}${treble(560, 330)}`, L, lin(a, [c[1], c[0], c[0]]));
    },
    jig(c, o, L) {
      const a = id('a'), h = id('h');
      const k = o.small ? 0.78 : 1, d = o.wide ? 1.35 : 1;
      let scales = '';
      for (let x = 240; x < 580; x += 22) scales += `<path d="M${x},${300 - 34 * d} L${x + 30},${300 + 34 * d}" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
      return wrap(`<g transform="translate(${400 - 400 * k},${300 - 300 * k}) scale(${k})"><clipPath id="${h}"><path d="M200,300 C260,${300 - 50 * d} 420,${300 - 56 * d} 600,${300 - 12 * d} C612,296 612,304 600,${300 + 12 * d} C420,${300 + 56 * d} 260,${300 + 50 * d} 200,300 Z"/></clipPath>
        <path d="M200,300 C260,${300 - 50 * d} 420,${300 - 56 * d} 600,${300 - 12 * d} C612,296 612,304 600,${300 + 12 * d} C420,${300 + 56 * d} 260,${300 + 50 * d} 200,300 Z" fill="url(#${a})"/>
        <g clip-path="url(#${h})">${scales}</g>
        ${eye(250, 292, 10)}
        <circle cx="190" cy="300" r="8" fill="none" stroke="#3b4045" stroke-width="3"/>
        <path d="M184,300 C160,320 170,352 190,360" stroke="#c9b27a" stroke-width="4" fill="none"/>
        <path d="M190,360 L190,396 C190,420 222,420 224,398 L220,390" stroke="#3b4045" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
        L, lin(a, [c[1], c[0], '#ffffff', c[0], c[1]]));
    },
    vib(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M200,310 C200,240 300,200 420,210 C520,220 590,260 614,300 C590,340 520,370 420,372 C300,375 200,360 200,310 Z" fill="url(#${a})"/>
        <path d="M230,280 Q380,210 590,290" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none"/>
        ${eye(250, 300, 15)}<circle cx="340" cy="206" r="7" fill="none" stroke="#3b4045" stroke-width="3"/>
        ${treble(330, 372)}${treble(520, 356)}`, L, lin(a, [c[0], c[0], c[1]]));
    },
    egi(c, o, L) {
      const a = id('a'), t = id('t');
      let spikes = '';
      for (let i = -6; i <= 6; i++) spikes += `<path d="M618,${300 + i * 4} l${38 + Math.abs(i) * 0.5},${i * 7} l-6,-4" stroke="#8a9096" stroke-width="2.4" fill="none"/>`;
      return wrap(`<pattern id="${t}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="${c[0]}"/><path d="M0,0 L0,10" stroke="#000" stroke-opacity=".12" stroke-width="3"/></pattern>
        ${spikes}
        <path d="M170,300 C170,262 230,244 320,244 L560,262 C600,266 624,282 624,300 C624,318 600,334 560,338 L320,356 C230,356 170,338 170,300 Z" fill="url(#${t})"/>
        <path d="M170,300 C170,262 230,244 320,244 L560,262 C600,266 624,282 624,300 C624,318 600,334 560,338 L320,356 C230,356 170,338 170,300 Z" fill="url(#${a})" opacity=".55"/>
        <path d="M380,250 L430,212 L462,258 Z M380,350 L430,388 L462,342 Z" fill="${c[0]}" opacity=".85"/>
        <path d="M160,318 L210,346 L236,330 L186,300 Z" fill="#3a3f43"/>
        ${eye(230, 286, 17)}<circle cx="164" cy="296" r="6" fill="none" stroke="#3b4045" stroke-width="3"/>`,
        L, lin(a, ['#ffffff', c[1], c[0]]));
    },
    jibionera(c, o, L) {
      const a = id('a');
      let crowns = '';
      [430, 462].forEach((y) => { for (let i = -7; i <= 7; i++) crowns += `<path d="M${400 + i * 7},${y} l${i * 5},32 l4,-6" stroke="#8a9096" stroke-width="2.4" fill="none"/>`; });
      return wrap(`<circle cx="400" cy="120" r="8" fill="none" stroke="#3b4045" stroke-width="3"/>
        <rect x="350" y="128" width="100" height="300" rx="48" fill="url(#${a})"/>
        <rect x="350" y="128" width="100" height="300" rx="48" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
        <path d="M372,160 L372,390" stroke="#fff" stroke-opacity=".6" stroke-width="7" stroke-linecap="round"/>
        ${eye(380, 200, 9)}${eye(420, 200, 9)}${crowns}`, L, lin(a, [c[0], c[1], c[0]], false));
    },
    sabiki(c, o, L) {
      let s = `<path d="M400,70 L400,470" stroke="#9aa5ab" stroke-width="2"/><circle cx="400" cy="62" r="8" fill="none" stroke="#3b4045" stroke-width="3"/>`;
      for (let i = 0; i < 6; i++) {
        const y = 110 + i * 62, dir = i % 2 ? -1 : 1;
        s += `<path d="M400,${y} l${dir * 60},14" stroke="#9aa5ab" stroke-width="1.6"/><path d="M${400 + dir * 60},${y + 14} l${dir * 30},4" stroke="${c[1]}" stroke-width="7" stroke-linecap="round"/><path d="M${400 + dir * 60},${y + 18} l${dir * 34},10" stroke="${c[0]}" stroke-width="5" stroke-linecap="round" opacity=".9"/><path d="M${400 + dir * 94},${y + 22} q${dir * 12},10 0,18" stroke="#3b4045" stroke-width="2.6" fill="none"/>`;
      }
      return wrap(s + `<path d="M386,470 L414,470 L420,500 L380,500 Z" fill="#5b6166"/>`, L);
    },
    rod(c, o, L) {
      const bl = id('b'), gr = id('g'), rs = id('r');
      let guides = '';
      [[370, 15], [450, 12], [520, 10], [585, 8], [640, 6.5], [690, 5.5], [730, 4.5], [760, 3.5]].forEach(([x, r]) => {
        guides += `<rect x="${x - 6}" y="${298 - 3}" width="12" height="7" fill="${c[1]}" opacity=".8"/><path d="M${x - 5},298 L${x},${298 - r * 2} L${x + 5},298" stroke="#6e767b" stroke-width="1.6" fill="none"/><circle cx="${x}" cy="${298 - r * 2 - r}" r="${r}" fill="none" stroke="#50585d" stroke-width="2"/>`;
      });
      return wrap(`<g transform="rotate(-24 400 300) translate(-10 0)">
        <path d="M300,294 L780,299 L780,301 L300,306 Z" fill="url(#${bl})"/>
        ${guides}
        <rect x="54" y="286" width="18" height="28" rx="6" fill="#1f2224"/>
        <rect x="70" y="288" width="112" height="24" rx="10" fill="url(#${gr})"/>
        <rect x="180" y="289" width="64" height="22" rx="4" fill="url(#${rs})"/>
        <rect x="190" y="286" width="12" height="28" rx="3" fill="#2b2f32"/>
        <rect x="242" y="290" width="58" height="20" rx="8" fill="url(#${gr})"/>
        <text x="330" y="318" font-family="Poppins, sans-serif" font-weight="700" font-size="11" letter-spacing="3" fill="${c[1]}">VESCORA</text>
      </g>`, L, lin(bl, [c[0], '#6d7478', c[0]]) + lin(gr, [c[1], '#1c1e20'], true) + lin(rs, ['#6d7478', '#2b2f32']));
    },
    reel(c, o, L) {
      const b = id('b'), m = id('m'), sp = id('s');
      const k = o.small ? 0.84 : o.large ? 1.1 : 1;
      let wraps = '';
      for (let y = 292; y < 372; y += 5) wraps += `<path d="M200,${y} L298,${y + 1}" stroke="#000" stroke-opacity=".07"/>`;
      return wrap(`<g transform="translate(${400 - 400 * k},${320 - 320 * k}) scale(${k})">
        <rect x="330" y="160" width="150" height="13" rx="6" fill="#26292b"/>
        <path d="M378,172 L426,172 C430,206 446,238 458,262 L402,264 C392,236 382,206 378,172 Z" fill="url(#${b})"/>
        <path d="M360,330 C360,280 400,258 452,258 C512,258 544,296 544,336 C544,382 506,408 456,408 C400,408 360,382 360,330 Z" fill="url(#${b})"/>
        <path d="M362,272 L300,282 L300,380 L362,390 Z" fill="#23272a"/>
        <rect x="196" y="286" width="106" height="92" rx="10" fill="url(#${sp})"/>${wraps}
        <rect x="186" y="280" width="18" height="104" rx="6" fill="url(#${m})"/>
        <rect x="168" y="306" width="20" height="52" rx="5" fill="#26292b"/>
        <path d="M306,276 Q180,244 178,330 Q180,414 306,390" stroke="url(#${m})" stroke-width="5" fill="none"/>
        <circle cx="306" cy="276" r="7" fill="#26292b"/>
        <path d="M470,336 L598,258" stroke="url(#${m})" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="610" cy="248" rx="26" ry="15" transform="rotate(-30 610 248)" fill="#26292b"/>
        <circle cx="462" cy="334" r="18" fill="#26292b"/>
        <text x="410" y="386" font-family="Poppins, sans-serif" font-weight="700" font-size="12" letter-spacing="3" fill="#e9e5da" opacity=".85">VESCORA</text>
      </g>`, L, lin(b, ['#5e666b', c[0], '#141618']) + lin(m, ['#e6e9ea', c[1], '#6b7378']) + lin(sp, ['#b8bbb5', '#7c807c']));
    },
    spool(c, o, L) {
      const a = id('a'), f = id('f');
      const k = o.small ? 0.85 : 1;
      let lines = '';
      for (let y = 190; y < 420; y += 6) lines += `<path d="M284,${y} L516,${y}" stroke="#000" stroke-opacity=".08"/>`;
      return wrap(`<g transform="translate(${400 - 400 * k},${300 - 300 * k}) scale(${k})">
        <ellipse cx="284" cy="300" rx="56" ry="150" fill="${c[1]}"/>
        <rect x="284" y="178" width="232" height="244" fill="url(#${a})" opacity="${o.clear ? 0.8 : 1}"/>${lines}
        <rect x="330" y="252" width="140" height="96" rx="4" fill="#f4f1e8"/>
        <text x="400" y="296" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="20" letter-spacing="5" fill="#16181a">VESCORA</text>
        <text x="400" y="322" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" letter-spacing="2" fill="#6f6c66">LINE SYSTEM</text>
        <ellipse cx="516" cy="300" rx="56" ry="150" fill="url(#${f})"/>
        <ellipse cx="516" cy="300" rx="18" ry="46" fill="#15181a"/>
      </g>`, L, lin(a, [c[0], '#ffffff', c[0], c[0]]) + lin(f, ['#5d6368', c[1]], false));
    },
    jighead(c, o, L) {
      const a = id('a');
      const r = o.small ? 30 : o.large ? 46 : 38;
      return wrap(`<path d="M300,${300} L560,300 C630,300 630,400 560,400 C520,400 500,372 500,352 L512,364" stroke="#3b4045" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="300" cy="300" r="${r}" fill="url(#${a})"/>
        <circle cx="300" cy="${300 - r - 10}" r="10" fill="none" stroke="#3b4045" stroke-width="4"/>
        ${eye(286, 290, r * 0.32)}<path d="M${300 + r + 6},292 l14,-10" stroke="#3b4045" stroke-width="4"/>`, L, lin(a, ['#f1f2f0', c[1], c[0]]));
    },
    snap(c, o, L) {
      return wrap(`<path d="M400,150 C446,150 452,200 442,262 L420,430 C416,462 384,462 380,430 L358,262 C348,200 356,150 400,150 Z" fill="none" stroke="${c[0]}" stroke-width="8" stroke-linejoin="round"/>
        <path d="M400,150 C446,150 452,200 442,262" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
        <circle cx="400" cy="470" r="18" fill="none" stroke="${c[1]}" stroke-width="7"/>`, L);
    },
    swivel(c, o, L) {
      const a = id('a');
      return wrap(`<circle cx="400" cy="170" r="34" fill="none" stroke="${c[0]}" stroke-width="10"/>
        <rect x="376" y="206" width="48" height="190" rx="22" fill="url(#${a})"/>
        <circle cx="400" cy="432" r="34" fill="none" stroke="${c[0]}" stroke-width="10"/>`, L, lin(a, [c[1], '#e9ecec', c[1]], false));
    },
    hook(c, o, L) {
      return wrap(`<circle cx="360" cy="130" r="16" fill="none" stroke="${c[0]}" stroke-width="9"/>
        <path d="M360,146 L360,380 C360,452 470,452 470,372 L470,330 L448,356" fill="none" stroke="${c[0]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M364,160 L364,370" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>`, L);
    },
    box(c, o, L) {
      const lures = ['#e6793d', '#2f5f86', '#c7d25a', '#e9dcc0', '#9c5d74', '#3f6b4f', '#d8b96a', '#8fa3ad'];
      let s = `<rect x="140" y="150" width="520" height="320" rx="22" fill="${c[1]}"/><rect x="150" y="160" width="500" height="300" rx="16" fill="${c[0]}"/>`;
      for (let i = 0; i < 3; i++) s += `<path d="M150,${160 + (i + 1) * 75} L650,${160 + (i + 1) * 75}" stroke="${c[1]}" stroke-opacity=".35" stroke-width="4"/>`;
      [316, 483].forEach((x) => { s += `<path d="M${x},160 L${x},460" stroke="${c[1]}" stroke-opacity=".35" stroke-width="4"/>`; });
      let n = 0;
      for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) {
        const cx = 233 + q * 167, cy = 197 + r * 75, col = lures[n++ % lures.length];
        s += `<ellipse cx="${cx}" cy="${cy}" rx="56" ry="15" fill="${col}"/><circle cx="${cx - 40}" cy="${cy - 3}" r="4" fill="#15181a"/>`;
      }
      s += `<rect x="150" y="160" width="500" height="300" rx="16" fill="#fff" opacity=".18"/><path d="M170,170 L330,170" stroke="#fff" stroke-width="6" opacity=".5" stroke-linecap="round"/>`;
      s += `<rect x="370" y="140" width="60" height="22" rx="6" fill="${c[1]}"/><rect x="370" y="458" width="60" height="22" rx="6" fill="${c[1]}"/>`;
      return wrap(s, L);
    },
    pliers(c, o, L) {
      const m = id('m');
      return wrap(`<g transform="rotate(-18 400 300)">
        <path d="M190,290 L420,286 L430,296 L190,306 Z" fill="${c[0]}"/><path d="M190,318 L420,314 L430,304 L190,334 Z" fill="${c[0]}" opacity=".85"/>
        <rect x="190" y="286" width="150" height="20" rx="8" fill="#1f2224"/><rect x="190" y="314" width="150" height="20" rx="8" fill="#1f2224"/>
        <circle cx="440" cy="300" r="16" fill="url(#${m})"/>
        <path d="M452,292 L640,294 L620,300 L452,304 Z" fill="url(#${m})"/><path d="M452,300 L620,300 L640,306 L452,310 Z" fill="url(#${m})" opacity=".85"/>
        <path d="M190,330 C120,380 160,450 230,420" stroke="${c[0]}" stroke-width="4" fill="none" stroke-dasharray="10 5"/></g>`, L, lin(m, [c[1], '#f3f4f2', '#7b8286']));
    },
    backpack(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M296,178 C296,120 504,120 504,178" stroke="${c[1]}" stroke-width="16" fill="none"/>
        <rect x="260" y="160" width="280" height="330" rx="46" fill="url(#${a})"/>
        <path d="M260,230 C300,200 500,200 540,230 L540,250 L260,250 Z" fill="#000" opacity=".12"/>
        <rect x="300" y="320" width="200" height="140" rx="22" fill="#000" opacity=".12"/>
        <path d="M300,340 L500,340" stroke="${c[1]}" stroke-width="3" stroke-dasharray="6 5" opacity=".5"/>
        <rect x="368" y="270" width="64" height="30" rx="4" fill="#e7e1d2"/><text x="400" y="291" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="11" letter-spacing="2" fill="#16181a">VSC</text>
        <rect x="540" y="200" width="30" height="240" rx="12" fill="${c[1]}" opacity=".85"/>
        <path d="M556,210 L610,40" stroke="#2c3230" stroke-width="5"/>
        <rect x="230" y="260" width="30" height="170" rx="12" fill="${c[1]}" opacity=".6"/>`, L, lin(a, [c[0], '#2d3223']));
    },
    bag(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M230,240 C230,90 570,90 570,240" stroke="${c[1]}" stroke-width="14" fill="none"/>
        <path d="M190,250 L610,250 L590,470 L210,470 Z" fill="url(#${a})"/>
        <path d="M190,250 L610,250 L600,330 L200,330 Z" fill="#000" opacity=".1"/>
        <rect x="360" y="296" width="80" height="20" rx="4" fill="${c[1]}"/>
        <rect x="240" y="360" width="140" height="80" rx="10" fill="#000" opacity=".1"/>
        <rect x="560" y="300" width="36" height="120" rx="10" fill="${c[1]}" opacity=".8"/>`, L, lin(a, [c[0], '#8d7c60']));
    },
    spoon(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M150,300 L250,300" stroke="#8a9096" stroke-width="3"/><circle cx="146" cy="300" r="7" fill="none" stroke="#3b4045" stroke-width="3"/>
        <ellipse cx="300" cy="262" rx="52" ry="96" transform="rotate(-62 300 262)" fill="url(#${a})"/>
        <ellipse cx="292" cy="250" rx="18" ry="50" transform="rotate(-62 292 250)" fill="#fff" opacity=".35"/>
        <rect x="250" y="292" width="200" height="16" rx="8" fill="#6c7276"/>
        <circle cx="300" cy="300" r="10" fill="#c9a64a"/><circle cx="350" cy="300" r="10" fill="#c9a64a"/><circle cx="400" cy="300" r="10" fill="#b8323a"/>
        ${treble(470, 300, 1.1).replace('translate(470,300)', 'translate(470,300) rotate(-90)')}`, L, lin(a, ['#f2f3f1', c[0], c[1]], false));
    },
    fly(c, o, L) {
      let hackle = '';
      for (let i = -6; i <= 6; i++) hackle += `<path d="M300,${o.dry ? 250 : 300} l${i * 7},${o.dry ? -70 : -34}" stroke="${c[1]}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
      return wrap(`<path d="M260,300 L520,300 C600,300 600,400 520,400 C480,400 470,370 470,352 L486,364" stroke="#2c2f31" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="250" cy="300" r="12" fill="none" stroke="#2c2f31" stroke-width="5"/>
        <path d="M290,286 C340,276 450,282 500,294 L500,306 C450,318 340,324 290,314 Z" fill="${c[0]}"/>
        ${o.dry ? `<path d="M480,290 l60,-60 M488,292 l70,-48" stroke="${c[1]}" stroke-width="4"/>` : `<path d="M500,300 l60,-14 M500,300 l60,14" stroke="${c[0]}" stroke-width="5" stroke-linecap="round"/><circle cx="292" cy="300" r="16" fill="#c08a4a"/>`}
        ${hackle}`, L);
    },
    flyreel(c, o, L) {
      const a = id('a'), b = id('b');
      return wrap(`<rect x="330" y="128" width="140" height="14" rx="7" fill="#26292b"/><rect x="388" y="140" width="24" height="40" fill="#26292b"/>
        <circle cx="400" cy="320" r="150" fill="url(#${a})"/>
        <circle cx="400" cy="320" r="118" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>
        ${[0, 60, 120, 180, 240, 300].map((d) => `<circle cx="${400 + 78 * Math.cos(d * Math.PI / 180)}" cy="${320 + 78 * Math.sin(d * Math.PI / 180)}" r="22" fill="url(#${b})"/>`).join('')}
        <circle cx="400" cy="320" r="26" fill="#26292b"/><rect x="452" y="226" width="16" height="44" rx="8" fill="#26292b"/>
        <text x="400" y="440" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="13" letter-spacing="4" fill="#e9e5da" opacity=".85">VESCORA</text>`,
        L, lin(a, ['#e6e9ea', c[1], c[0]]) + lin(b, ['#141618', '#3a3f43']));
    },
    boilies(c, o, L) {
      const pts = [[300, 330, 46], [390, 300, 46], [480, 336, 46], [350, 400, 46], [440, 408, 46], [520, 410, 40], [260, 410, 40]];
      return wrap(pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c[0]}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity=".25"/><circle cx="${x + r * 0.2}" cy="${y + r * 0.1}" r="${r * 0.12}" fill="${c[1]}" opacity=".6"/>`).join(''), L);
    },
    glasses(c, o, L) {
      const a = id('a');
      return wrap(`<path d="M160,250 L110,230" stroke="${c[0]}" stroke-width="10" stroke-linecap="round"/><path d="M640,250 L690,230" stroke="${c[0]}" stroke-width="10" stroke-linecap="round"/>
        <path d="M170,250 C170,230 370,226 370,256 C370,330 330,350 270,350 C200,350 170,310 170,250 Z" fill="url(#${a})" stroke="${c[0]}" stroke-width="12"/>
        <path d="M630,250 C630,230 430,226 430,256 C430,330 470,350 530,350 C600,350 630,310 630,250 Z" fill="url(#${a})" stroke="${c[0]}" stroke-width="12"/>
        <path d="M370,262 Q400,244 430,262" stroke="${c[0]}" stroke-width="10" fill="none"/>
        <path d="M200,270 L250,250 M480,266 L540,248" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/>`, L, lin(a, [c[1], '#15191b']));
    }
  };

  function product(p) {
    const fn = draw[p.art.k] || draw.softbait;
    return fn(p.art.c, p.art, `${p.name} — ${p.type}`);
  }

  window.VescoraArt = { scene, product };
})();
