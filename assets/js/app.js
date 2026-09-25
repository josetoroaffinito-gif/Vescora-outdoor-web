/*
 * VESCORA — Aplicación de una sola página.
 * Router con URLs amigables (History API), vistas, buscador, "Tu equipo" y SEO por ruta.
 */
(function () {
  const D = window.VESCORA;
  const A = window.VescoraArt;
  const BASE = window.VESCORA_BASE || '/';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d)\s*g\b/g, '$1g');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——— Índices ———
  const by = (arr, k = 'id') => Object.fromEntries(arr.map((x) => [x[k], x]));
  const PROD = by(D.products), CAT = by(D.categories), TECH = by(D.techniques), SPEC = by(D.species), COND = by(D.conditions), ART = by(D.journal, 'slug');
  const subName = (p) => (CAT[p.category].sub.find((s) => s.id === p.sub) || {}).name || '';
  const pUrl = (p) => `equipamiento/${p.category}/${p.id}`;
  const arrow = '<span class="arr" aria-hidden="true">→</span>';
  const ext = '<span aria-hidden="true">↗</span>';

  // ——— Media: fotografía real si existe; si no, ilustración ———
  function sceneMedia(o, cls = '', label) {
    const alt = label || o.alt || o.name || o.title || 'VESCORA';
    const inner = o.photo
      ? `<img src="${esc(o.photo)}" alt="${esc(alt)}" loading="lazy" decoding="async">`
      : A.scene(o.scene || 'coast', { label: alt, seed: o.id || o.slug, flip: o.flip });
    return `<div class="media grain ${cls}">${inner}</div>`;
  }
  const prodArt = (p) => (p.photo ? `<img src="${esc(p.photo)}" alt="${esc('VESCORA ' + p.name)}" loading="lazy" decoding="async">` : A.product(p));

  function specLine(p) {
    const s = [p.length, p.specs.Peso || p.specs['Acción de lance']].filter((x) => x && x !== '—');
    return s.join(' · ');
  }

  function card(p, i = 0) {
    const tech = p.techniques[0] ? TECH[p.techniques[0]].name : '';
    return `<a class="card reveal reveal-d${i % 4}" href="${pUrl(p)}">
      <div class="card__media">${prodArt(p)}<span class="card__tag">${esc(subName(p))}</span></div>
      <div class="card__body">
        <div class="card__name">VESCORA ${esc(p.name)}</div>
        <div class="card__type">${esc(p.type)}</div>
        <div class="card__spec">${esc(specLine(p))}</div>
        <div class="card__foot"><span class="tag tech">${esc(tech)}</span><span class="link-arrow">Explorar ${arrow}</span></div>
      </div>
    </a>`;
  }

  const crumbs = (items) => `<nav class="crumbs" aria-label="Migas de pan">${items.map(([t, u], i) => (i ? '<span aria-hidden="true">/</span>' : '') + (u ? `<a href="${u}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`)).join('')}</nav>`;
  const ldCrumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: D.site.domain + '/' + (u || '').replace(/^\.\//, '') })) });

  function pageHero({ eyebrow, title, lede, scene, crumbsHtml = '', extra = '' }) {
    return `<section class="page-hero">
      <div class="page-hero__media">${sceneMedia(scene, '', title)}</div>
      <div class="wrap page-hero__content">
        ${crumbsHtml}
        ${eyebrow ? `<div class="eyebrow on-dark" style="color:rgba(245,243,236,.75)">${esc(eyebrow)}</div>` : ''}
        <h1 class="h1" style="margin-top:14px">${esc(title)}</h1>
        ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
        ${extra}
      </div>
    </section>`;
  }

  // ——— Relaciones ———
  const productsFor = (key, id) => D.products.filter((p) => p[key].includes(id));
  const group = (list, cat) => list.filter((p) => p.category === cat);

  // ——— "Tu equipo" ———
  const BANDS = { 'b1': ['Hasta 10 g', 0, 10], 'b2': ['10 – 20 g', 10, 20], 'b3': ['20 – 40 g', 20, 40], 'b4': ['Más de 40 g', 40, 999] };
  function scenariosFor(speciesId) {
    const set = new Set();
    productsFor('species', speciesId).forEach((p) => p.conditions.forEach((c) => COND[c] && COND[c].scenario && set.add(c)));
    return D.conditions.filter((c) => set.has(c.id));
  }
  function buildKit(s) {
    const [, lo, hi] = BANDS[s.band];
    const mid = (lo + Math.min(hi, 80)) / 2;
    const fit = (w) => (w == null ? 0 : w >= lo && w <= hi ? 3 : -Math.min(3, Math.abs(w - mid) / 10));
    const rank = (list, extra = () => 0) => list
      .map((p, i) => ({ p, i, sc: (p.species.includes(s.species) ? 4 : 0) + (p.conditions.includes(s.scenario) ? 2 : 0) + extra(p) }))
      .sort((a, b) => b.sc - a.sc || a.i - b.i).map((x) => x.p);
    const withTech = (cat, subs) => D.products.filter((p) => p.category === cat && p.techniques.includes(s.technique) && (!subs || subs.includes(p.sub)));
    const kit = [];
    const lures = rank(withTech('senuelos').filter((p) => p.species.includes(s.species)), (p) => fit(p.weight));
    if (lures[0]) kit.push(['Señuelo', lures[0]]);
    if (lures[0] && lures[0].pairs) {
      const heads = lures[0].pairs.map((id) => PROD[id]).sort((a, b) => fit(b.weight) - fit(a.weight) || Math.abs(a.weight - mid) - Math.abs(b.weight - mid));
      kit.push(['Cabeza plomada', heads[0]]);
    }
    if (lures[1]) kit.push(['Alternativa', lures[1]]);
    if (s.technique === 'surfcasting') {
      const hook = rank(withTech('accesorios', ['anzuelos']))[0]; if (hook) kit.push(['Anzuelo', hook]);
    }
    const leader = rank(withTech('lineas', ['fluorocarbono', 'bajos']))[0]; if (leader) kit.push(['Bajo', leader]);
    const conn = rank(withTech('accesorios', s.technique === 'surfcasting' ? ['giratorios'] : ['grapas', 'giratorios']))[0]; if (conn) kit.push(['Conexión', conn]);
    const main = rank(withTech('lineas', ['trenzado', 'monofilamento']))[0]; if (main) kit.push(['Línea madre', main]);
    const rod = rank(withTech('canas'), (p) => (p.weightRange && p.weightRange[0] <= hi && p.weightRange[1] >= lo ? 3 : 0))[0]; if (rod) kit.push(['Caña', rod]);
    const reel = rank(withTech('carretes'))[0]; if (reel) kit.push(['Carrete', reel]);
    return kit;
  }

  function finderHtml(state, full) {
    const sp = D.species;
    const scen = state.species ? scenariosFor(state.species) : [];
    const techs = state.species ? SPEC[state.species].techniques.map((t) => TECH[t]) : [];
    const pill = (step, val, label) => `<button type="button" class="chip" data-step="${step}" data-val="${val}" aria-pressed="${state[step] === val}">${esc(label)}</button>`;
    const step = (n, key, label, opts, enabled) => `<div class="step ${enabled ? '' : 'is-disabled'}"><div class="step__label"><span>0${n}</span><strong>${label}</strong></div><div class="chips">${opts}</div></div>`;
    const ready = state.species && state.scenario && state.technique && state.band;
    let kitHtml;
    if (ready) {
      const kit = buildKit(state);
      const q = new URLSearchParams(state).toString();
      kitHtml = `<p class="kit__path">${esc(SPEC[state.species].name)} → ${esc(COND[state.scenario].name)} → ${esc(TECH[state.technique].name)} → ${esc(BANDS[state.band][0])}</p>
        <ul class="kit__list">${kit.map(([role, p]) => `<li><a href="${pUrl(p)}"><span class="thumb">${A.product(p)}</span><span><span class="kit__role">${esc(role)}</span><strong>${esc(p.name)}</strong><span class="small muted">${esc(specLine(p))}</span></span>${arrow}</a></li>`).join('')}</ul>
        <div class="kit__foot"><a class="link-arrow" href="tecnicas/${state.technique}">Guía de ${esc(TECH[state.technique].name)} ${arrow}</a>${full ? '' : `<a class="link-arrow" href="tu-equipo?${q}">Abrir y compartir ${arrow}</a>`}</div>`;
    } else {
      kitHtml = `<p class="kit__empty">Responde a las cuatro preguntas y VESCORA te propondrá un equipo de partida: señuelo, montaje, línea y conexión.</p>`;
    }
    return `<div class="finder" data-finder data-full="${full ? 1 : 0}">
      <div class="finder__steps">
        ${step(1, 'species', 'Quiero pescar', sp.map((x) => pill('species', x.id, x.name)).join(''), true)}
        ${step(2, 'scenario', 'Escenario', scen.map((x) => pill('scenario', x.id, x.name)).join('') || '<span class="small" style="opacity:.6">Elige una especie</span>', !!state.species)}
        ${step(3, 'technique', 'Técnica', techs.map((x) => pill('technique', x.id, x.name)).join('') || '<span class="small" style="opacity:.6">Elige una especie</span>', !!state.scenario)}
        ${step(4, 'band', 'Peso de lance', Object.entries(BANDS).map(([k, v]) => pill('band', k, v[0])).join(''), !!state.technique)}
      </div>
      <div class="kit" aria-live="polite"><div class="kit__head"><span class="kit__title">TU EQUIPO</span><span class="tag">${ready ? 'Propuesta VESCORA' : 'Pendiente'}</span></div>${kitHtml}</div>
    </div>`;
  }

  function bindFinder(root, initial) {
    const box = $('[data-finder]', root);
    if (!box) return;
    const state = Object.assign({ species: '', scenario: '', technique: '', band: '' }, initial);
    const full = box.dataset.full === '1';
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const k = b.dataset.step, v = b.dataset.val;
      state[k] = state[k] === v ? '' : v;
      const order = ['species', 'scenario', 'technique', 'band'];
      order.slice(order.indexOf(k) + 1).forEach((kk) => {
        if (kk === 'band') return;
        if (kk === 'scenario' && state.species && !scenariosFor(state.species).some((c) => c.id === state.scenario)) state.scenario = '';
        if (kk === 'technique' && state.species && !SPEC[state.species].techniques.includes(state.technique)) state.technique = '';
        if (!state.species) { state.scenario = ''; state.technique = ''; }
      });
      box.outerHTML = finderHtml(state, full);
      bindFinder(root, state);
      if (full) history.replaceState(null, '', 'tu-equipo' + (Object.values(state).some(Boolean) ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(state).filter(([, x]) => x))) : ''));
    }, { once: true });
  }

  // ——— Vistas ———
  const V = {};

  V.home = () => {
    const featured = D.products.filter((p) => p.featured);
    const ig = [
      ['scene', { scene: 'dawn', id: 'ig1' }, 'Primera luz'], ['prod', PROD['drift-minnow-110f'], 'Drift Minnow 110F'], ['scene', { scene: 'rock', id: 'ig2' }, 'Costa rocosa'],
      ['prod', PROD['egi-30-night'], 'Egi Night 3.0'], ['scene', { scene: 'night', id: 'ig3' }, 'Noches de eging'], ['scene', { scene: 'forest', id: 'ig4' }, 'Fuera del camino']
    ];
    return {
      title: 'VESCORA — Equipment for the wild · Equipamiento de pesca',
      description: 'VESCORA es una marca outdoor cuyo territorio inicial es la pesca. Descubre equipamiento por catálogo, por técnica y por especie.',
      over: true,
      html: `
      <section class="hero">
        <div class="hero__media" data-parallax>${sceneMedia({ scene: 'dawn', id: 'hero', flip: true }, '', 'Pescador lanzando desde la roca al amanecer')}</div>
        <div class="wrap hero__content">
          <div class="hero__kicker">Equipment for the wild</div>
          <h1 class="hero__title">VESCORA</h1>
          <div class="hero__foot">
            <p class="hero__text">Equipamiento para quienes encuentran su lugar fuera del camino.</p>
            <div class="hero__ctas">
              <a class="btn btn--light" href="equipamiento">Explorar equipamiento ${arrow}</a>
              <a class="btn btn--ghost" href="vescora"><span>Descubrir Vescora</span></a>
            </div>
          </div>
        </div>
        <div class="hero__scroll" aria-hidden="true">Desliza</div>
      </section>

      <section class="section">
        <div class="wrap manifesto">
          <div class="reveal">
            ${sceneMedia({ scene: 'river', id: 'manifesto' }, 'manifesto__media', 'Río entre bosques a primera hora')}
            <div class="manifesto__caption"><span>Río · Primera hora</span><span>01 / Manifiesto</span></div>
          </div>
          <div class="manifesto__text reveal reveal-d1">
            <div class="eyebrow">Manifiesto</div>
            <h2 class="h2" style="margin:20px 0 36px">Más que equipamiento</h2>
            <p>Creemos que la pesca empieza mucho antes del primer lance.</p>
            <p>Empieza al elegir el equipo, estudiar el escenario y entender qué tienes delante.</p>
            <p>VESCORA nace para acompañar cada una de esas decisiones.</p>
            <a class="link-arrow" href="vescora" style="margin-top:12px">Nuestra historia ${arrow}</a>
          </div>
        </div>
      </section>

      <section class="section section--paper2" id="encuentra">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Tres formas de descubrir Vescora</div><h2 class="h2" style="margin-top:18px">Encuentra tu equipo</h2></div>
            <p class="lede">Por lo que buscas, por cómo pescas o por lo que quieres pescar. Tres caminos al mismo equipo.</p></div>
          <div class="routes">
            ${[
              ['01', 'Equipamiento', '¿Sabes lo que buscas?', 'Explora directamente nuestro catálogo.', 'Ver equipamiento', 'equipamiento', { scene: 'harbor', id: 'r1' }],
              ['02', 'Técnicas', '¿Sabes cómo quieres pescar?', 'Descubre el equipamiento recomendado para cada técnica.', 'Explorar técnicas', 'tecnicas', { scene: 'coast', id: 'r2' }],
              ['03', 'Especies', '¿Sabes qué quieres pescar?', 'Descubre qué equipamiento puede ayudarte a enfrentarte a cada especie.', 'Explorar especies', 'especies', { scene: 'boat', id: 'r3' }]
            ].map(([n, t, q, d, c, u, sc], i) => `<a class="route reveal reveal-d${i}" href="${u}">${sceneMedia(sc, '', t)}<div class="route__body"><div class="route__num">${n} —</div><div class="route__title">${t}</div><p class="route__q">${q}</p><p class="route__t">${d}</p><span class="link-arrow">${c} ${arrow}</span></div></a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section section--forest on-dark">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Herramienta para el pescador</div><h2 class="h2" style="margin-top:18px">Tu equipo en cuatro decisiones</h2></div>
            <p class="lede">Especie, escenario, técnica y gramaje. VESCORA cruza su catálogo y te propone un punto de partida.</p></div>
          ${finderHtml({ species: 'lubina', scenario: 'costa-rocosa', technique: 'spinning', band: 'b2' }, false)}
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Selección</div><h2 class="h2" style="margin-top:18px">Equipamiento esencial</h2></div><a class="link-arrow" href="equipamiento">Todo el equipamiento ${arrow}</a></div>
          <div class="rail">${featured.map(card).join('')}</div>
        </div>
      </section>

      <section class="section section--tight">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Técnicas</div><h2 class="h2" style="margin-top:18px">Elige tu técnica</h2></div><a class="link-arrow" href="tecnicas">Todas las técnicas ${arrow}</a></div>
          <div class="tiles">${D.techniques.map((t, i) => tile(t, `tecnicas/${t.id}`, t.type, i)).join('')}</div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Especies</div><h2 class="h2" style="margin-top:18px">¿Qué quieres pescar?</h2></div><a class="link-arrow" href="especies">Todas las especies ${arrow}</a></div>
          <div class="tiles tiles--4">${D.species.slice(0, 4).map((s, i) => tile(s, `especies/${s.id}`, s.claim, i)).join('')}</div>
        </div>
      </section>

      <section class="section section--paper2">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Filosofía</div><h2 class="h2" style="margin-top:18px">Lo que nos mueve</h2></div><a class="link-arrow" href="vescora/filosofia">Nuestra filosofía ${arrow}</a></div>
          ${pillars()}
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Vescora Journal</div><h2 class="h2" style="margin-top:18px">Antes de salir</h2></div><a class="link-arrow" href="journal">Ir al Journal ${arrow}</a></div>
          <div class="jgrid">${D.journal.slice(0, 3).map(jcard).join('')}</div>
        </div>
      </section>

      <section class="section section--dark on-dark">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">${esc(D.site.instagramHandle)}</div><h2 class="h2" style="margin-top:18px">Follow the adventure</h2></div><a class="btn btn--ghost" href="${esc(D.site.instagram)}" target="_blank" rel="noopener"><span>Instagram ${ext}</span></a></div>
          <div class="ig">${ig.map(([k, o, cap], i) => `<a class="${k === 'prod' ? 'is-product' : ''} reveal reveal-d${i % 4}" href="${esc(D.site.instagram)}" target="_blank" rel="noopener" aria-label="${esc(cap)} en Instagram"><div class="media ${k === 'scene' ? 'grain' : ''}">${k === 'prod' ? prodArt(o) : A.scene(o.scene, { seed: o.id, label: cap })}</div><span class="ig__cap">${esc(cap)}</span></a>`).join('')}</div>
        </div>
      </section>`,
      ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'VESCORA', url: D.site.domain + '/', potentialAction: { '@type': 'SearchAction', target: D.site.domain + '/buscar?q={q}', 'query-input': 'required name=q' } },
      after: (root) => bindFinder(root, { species: 'lubina', scenario: 'costa-rocosa', technique: 'spinning', band: 'b2' })
    };
  };

  function tile(o, href, meta, i) {
    return `<a class="tile reveal reveal-d${i % 3}" href="${href}">${sceneMedia(o, '', o.name)}<span class="tile__arrow" aria-hidden="true">↗</span><div class="tile__body"><div class="tile__name">${esc(o.name)}</div><div class="tile__meta">${esc(meta)}</div></div></a>`;
  }
  function jcard(a) {
    return `<a class="jcard reveal" href="journal/${a.slug}">${sceneMedia({ scene: a.scene, id: a.slug, photo: a.photo }, '', a.title)}<div class="jcard__meta"><span>${esc(a.cat)}</span><span>${a.read} min</span></div><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p></a>`;
  }
  function pillars() {
    return `<div class="pillars">${[
      ['Calidad', 'Equipamiento seleccionado pensando en rendimiento y durabilidad.'],
      ['Exploración', 'La pesca como forma de descubrir nuevos lugares.'],
      ['Precisión', 'Los pequeños detalles marcan la diferencia.']
    ].map(([t, d], i) => `<div class="pillar reveal reveal-d${i}"><div class="pillar__n">0${i + 1}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`;
  }

  // Catálogo general y por categoría
  V.catalog = (catId, q) => {
    const cat = catId ? CAT[catId] : null;
    if (catId && !cat) return V.notFound();
    const f = { sub: q.get('tipo') || '', tec: q.get('tecnica') || '', esp: q.get('especie') || '' };
    let list = D.products.filter((p) => (!cat || p.category === cat.id) && (!f.sub || p.sub === f.sub) && (!f.tec || p.techniques.includes(f.tec)) && (!f.esp || p.species.includes(f.esp)));
    const base = cat ? `equipamiento/${cat.id}` : 'equipamiento';
    const qs = (patch) => { const o = Object.assign({}, { tipo: f.sub, tecnica: f.tec, especie: f.esp }, patch); const s = new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString(); return base + (s ? '?' + s : ''); };
    const chipsTop = cat
      ? [`<a class="chip ${!f.sub ? 'is-active' : ''}" href="${qs({ tipo: '' })}">Todo</a>`].concat(cat.sub.map((s) => `<a class="chip ${f.sub === s.id ? 'is-active' : ''}" href="${qs({ tipo: s.id })}">${esc(s.name)}</a>`))
      : [`<a class="chip is-active" href="equipamiento">Todo</a>`].concat(D.categories.map((c) => `<a class="chip" href="equipamiento/${c.id}">${esc(c.name)}</a>`));
    const title = cat ? cat.name : 'Equipamiento';
    const crumbItems = cat ? [['Inicio', './'], ['Equipamiento', 'equipamiento'], [cat.name]] : [['Inicio', './'], ['Equipamiento']];
    const intro = cat
      ? pageHero({ eyebrow: 'Equipamiento', title: cat.name, lede: cat.claim + ' ' + cat.intro, scene: { scene: cat.scene, id: 'cat-' + cat.id, photo: cat.photo }, crumbsHtml: crumbs(crumbItems) })
      : `<section class="page-head"><div class="wrap">${crumbs(crumbItems)}<h1 class="display">Equipamiento</h1><p class="lede">Señuelos, cañas, carretes, líneas y accesorios. Una selección pensada para funcionar como un sistema.</p></div></section>
        <section><div class="wrap"><div class="cats">${D.categories.map((c, i) => `<a class="cat reveal" href="equipamiento/${c.id}"><div class="cat__name"><small>0${i + 1}</small>${esc(c.name)}</div><div class="cat__sub">${c.sub.map((s) => esc(s.name)).join(' · ')}</div><div class="cat__media media">${A.product(D.products.find((p) => p.category === c.id))}</div></a>`).join('')}</div></div></section>`;
    return {
      title: cat ? `${cat.name} de pesca · Equipamiento` : 'Equipamiento de pesca',
      description: cat ? `${cat.claim} ${cat.intro}` : 'Catálogo VESCORA: señuelos, cañas, carretes, líneas y accesorios de pesca, organizados por técnica y especie.',
      over: !!cat,
      html: `${intro}
      <section class="section" style="padding-top:${cat ? 'clamp(40px,5vw,72px)' : 'clamp(56px,7vw,96px)'}">
        <div class="wrap">
          <div class="toolbar"><div class="toolbar__row">
            <div class="chips chips--scroll" style="flex:1;min-width:0">${chipsTop.join('')}</div>
            <div class="toolbar__selects">
              <label class="sr-only" for="f-tec">Técnica</label>
              <select id="f-tec" data-filter="tecnica"><option value="">Todas las técnicas</option>${D.techniques.map((t) => `<option value="${t.id}" ${f.tec === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
              <label class="sr-only" for="f-esp">Especie</label>
              <select id="f-esp" data-filter="especie"><option value="">Todas las especies</option>${D.species.map((s) => `<option value="${s.id}" ${f.esp === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
            </div>
          </div></div>
          <div class="head-row" style="margin-bottom:28px"><span class="count">${list.length} ${list.length === 1 ? 'producto' : 'productos'}</span>${f.tec ? `<a class="link-arrow" href="tecnicas/${f.tec}">Guía de ${esc(TECH[f.tec].name)} ${arrow}</a>` : ''}</div>
          ${list.length ? `<div class="grid grid--4">${list.map(card).join('')}</div>` : `<p class="empty">No hay productos con estos filtros. <a class="link-arrow" href="${base}">Ver todo ${arrow}</a></p>`}
        </div>
      </section>`,
      ld: ldCrumbs(crumbItems),
      after: (root) => $$('[data-filter]', root).forEach((s) => s.addEventListener('change', () => navigate(qs({ [s.dataset.filter]: s.value }), { keepScroll: true })))
    };
  };

  V.product = (catId, id) => {
    const p = PROD[id];
    if (!p || p.category !== catId) return V.notFound();
    const cat = CAT[p.category];
    const crumbItems = [['Inicio', './'], ['Equipamiento', 'equipamiento'], [cat.name, `equipamiento/${cat.id}`], [p.name]];
    const quick = [[p.category === 'canas' ? 'Longitud' : 'Medida', p.length], [p.category === 'canas' ? 'Lance' : 'Peso', p.specs.Peso || p.specs['Acción de lance'] || '—'], ['Tipo', p.type]];
    const specs = Object.assign({}, p.specs, { 'Técnica recomendada': p.techniques.map((t) => TECH[t].name).join(', ') }, p.species.length ? { 'Especies objetivo': p.species.map((s) => SPEC[s].name).join(', ') } : {});
    const related = (p.related || []).map((r) => PROD[r]).filter(Boolean);
    const sameCat = D.products.filter((x) => x.id !== p.id && x.sub === p.sub && x.category === p.category).slice(0, 4);
    const sceneKey = p.techniques[0] ? TECH[p.techniques[0]].scene : 'coast';
    const listings = Object.entries(p.listings || {}).filter(([k]) => D.site.platforms[k]).map(([k, v]) => ({ k, name: D.site.platforms[k].name, href: v || D.site.platforms[k].profile })).filter((x) => x.href);
    const whenIcons = { Condiciones: '◐', 'Tipo de agua': '≈', Profundidad: '↧', Recuperación: '↻', Escenario: '△' };
    return {
      title: `VESCORA ${p.name} · ${p.type}`,
      description: `${p.summary} ${p.description}`.slice(0, 158),
      html: `
      <div class="wrap product">
        <div class="product__gallery">
          ${crumbs(crumbItems)}
          <div class="gallery__main" id="gmain">${prodArt(p)}</div>
          <div class="gallery__thumbs" role="group" aria-label="Vistas del producto">
            <button type="button" data-view="light" aria-pressed="true" aria-label="Vista de estudio">${A.product(p)}</button>
            <button type="button" data-view="dark" class="t-dark" aria-pressed="false" aria-label="Vista en fondo oscuro">${A.product(p)}</button>
            <button type="button" data-view="scene" class="t-scene" aria-pressed="false" aria-label="Vista en su escenario">${A.scene(sceneKey, { seed: p.id, label: 'Escenario' })}</button>
          </div>
        </div>
        <div class="product__info">
          <div>
            <div class="eyebrow">${esc(cat.name)} · ${esc(subName(p))}</div>
            <h1 class="product__name" style="margin-top:16px">VESCORA ${esc(p.name)}</h1>
          </div>
          <dl class="quick">${quick.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <div><p class="lede" style="max-width:none">${esc(p.summary)}</p><p class="muted" style="margin-top:14px">${esc(p.description)}</p></div>
          <div class="recommended">
            <div><h2 class="block-title">Técnicas</h2><div class="chips">${p.techniques.map((t) => `<a class="chip" href="tecnicas/${t}">${esc(TECH[t].name)}</a>`).join('')}</div></div>
            ${p.species.length ? `<div><h2 class="block-title">Especies</h2><div class="chips">${p.species.map((s) => `<a class="chip" href="especies/${s}">${esc(SPEC[s].name)}</a>`).join('')}</div></div>` : ''}
          </div>
          <a class="btn" href="#encuentralo">Encuéntralo ${arrow}</a>
          <div><h2 class="block-title">Especificaciones</h2><dl class="specs">${Object.entries(specs).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
        </div>
      </div>

      ${p.when ? `<section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Guía de uso</div><h2 class="h2" style="margin-top:18px">Cuándo utilizarlo</h2></div></div>
          <dl class="when reveal">${Object.entries(p.when).map(([k, v]) => `<div><dt><span aria-hidden="true">${whenIcons[k] || '·'}</span>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          ${p.conditions.length ? `<div class="chips" style="margin-top:24px">${p.conditions.map((c) => `<span class="chip" style="cursor:default">${esc(COND[c].name)}</span>`).join('')}</div>` : ''}
        </div>
      </section>` : ''}

      ${related.length ? `<section class="section section--paper2">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Ecosistema Vescora</div><h2 class="h2" style="margin-top:18px">Completa el montaje</h2></div></div>
          <div class="eco">
            <div class="eco__now reveal"><div class="eyebrow on-dark">Estás viendo</div><div class="media">${A.product(p)}</div><div><div class="h3" style="text-transform:uppercase">${esc(p.name)}</div><div class="small" style="opacity:.7">${esc(specLine(p))}</div></div></div>
            <div class="reveal reveal-d1"><div class="block-title">También puedes necesitar</div><div class="eco__list">${related.map((r) => `<a class="eco__item" href="${pUrl(r)}"><span class="thumb">${A.product(r)}</span><span><span class="kit__role">${esc(subName(r))}</span><strong>${esc(r.name)}</strong><span class="small muted">${esc(specLine(r))}</span></span><span class="eco__plus" aria-hidden="true">+</span></a>`).join('')}</div></div>
          </div>
        </div>
      </section>` : ''}

      <section class="section" id="encuentralo">
        <div class="wrap">
          <div class="find reveal">
            <div><div class="eyebrow on-dark">Disponibilidad</div><h2 class="h2" style="margin:16px 0 14px">Encuéntralo</h2><p style="opacity:.8;max-width:40ch">Consulta la disponibilidad de este producto en nuestras plataformas de venta.</p></div>
            <div>
              ${listings.length ? `<div class="find__btns">${listings.map((l) => `<a class="find__btn" href="${esc(l.href)}" target="_blank" rel="noopener nofollow">${esc(l.name)} ${ext}</a>`).join('')}</div>` : `<p>Ahora mismo no está publicado en ninguna plataforma. <a class="link-arrow" href="contacto?motivo=disponibilidad&producto=${encodeURIComponent(p.name)}">Pregúntanos ${arrow}</a></p>`}
              <p class="find__note" style="margin-top:16px">VESCORA funciona como catálogo. La compra se realiza en la plataforma externa, bajo sus propias condiciones.</p>
            </div>
          </div>
        </div>
      </section>

      ${sameCat.length ? `<section class="section section--tight" style="padding-top:0">
        <div class="wrap"><div class="head-row reveal"><div><div class="eyebrow">${esc(subName(p))}</div><h2 class="h3" style="margin-top:14px;text-transform:uppercase">Más ${esc(subName(p).toLowerCase())}</h2></div><a class="link-arrow" href="equipamiento/${cat.id}?tipo=${p.sub}">Ver todos ${arrow}</a></div>
        <div class="grid grid--4">${sameCat.map(card).join('')}</div></div>
      </section>` : ''}`,
      ld: [ldCrumbs(crumbItems), {
        '@context': 'https://schema.org', '@type': 'Product', name: 'VESCORA ' + p.name, brand: { '@type': 'Brand', name: 'VESCORA' },
        description: p.description, category: `${cat.name} > ${subName(p)}`, url: D.site.domain + '/' + pUrl(p),
        additionalProperty: Object.entries(p.specs).map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v }))
      }],
      after: (root) => {
        const main = $('#gmain', root);
        $$('.gallery__thumbs button', root).forEach((b) => b.addEventListener('click', () => {
          $$('.gallery__thumbs button', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
          const v = b.dataset.view;
          main.className = 'gallery__main' + (v === 'dark' ? ' is-dark' : v === 'scene' ? ' is-scene grain' : '');
          main.innerHTML = v === 'scene' ? A.scene(sceneKey, { seed: p.id, label: 'Escenario habitual' }) + `<div class="gallery__float">${A.product(p)}</div>` : prodArt(p);
        }));
      }
    };
  };

  V.techniques = () => ({
    title: 'Técnicas de pesca · Elige tu técnica',
    description: 'Spinning, light spinning, rockfishing, eging, surfcasting y pesca desde embarcación: equipamiento recomendado para cada técnica.',
    html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Técnicas']])}<h1 class="display">Elige tu técnica</h1><p class="lede">Cada técnica es una forma distinta de leer el agua. Descubre qué equipo necesitas para cada una.</p></div></section>
      <section class="section" style="padding-top:0"><div class="wrap"><div class="tiles">${D.techniques.map((t, i) => tile(t, `tecnicas/${t.id}`, t.claim, i)).join('')}</div></div></section>`,
    ld: ldCrumbs([['Inicio', './'], ['Técnicas']])
  });

  function gearGroups(list, labelFor) {
    const groups = [['canas', 'Cañas y carretes', ['canas', 'carretes']], ['senuelos', 'Señuelos', ['senuelos']], ['lineas', 'Líneas', ['lineas']], ['accesorios', 'Accesorios', ['accesorios']]];
    return groups.map(([k, name, cats]) => {
      const items = list.filter((p) => cats.includes(p.category));
      if (!items.length) return '';
      return `<div class="gear-group"><div class="gear-group__head reveal"><h3>${name}</h3><a class="link-arrow" href="equipamiento/${k}${labelFor ? '?' + labelFor : ''}">Ver ${arrow}</a></div><div class="rail">${items.map(card).join('')}</div></div>`;
    }).join('');
  }

  V.technique = (id) => {
    const t = TECH[id];
    if (!t) return V.notFound();
    const list = productsFor('techniques', id);
    const sp = D.species.filter((s) => s.techniques.includes(id));
    const ci = [['Inicio', './'], ['Técnicas', 'tecnicas'], [t.name]];
    return {
      title: `${t.name} · Equipamiento recomendado`,
      description: `${t.claim} ${t.intro}`.slice(0, 158),
      over: true,
      html: `${pageHero({ eyebrow: 'Técnica', title: t.name, lede: t.claim, scene: { scene: t.scene, id: 'tech-' + t.id, photo: t.photo }, crumbsHtml: crumbs(ci) })}
      <section class="section section--dark on-dark" style="padding-top:clamp(48px,6vw,88px)">
        <div class="wrap">
          <div class="intro-grid"><div class="eyebrow">Qué es</div><p class="big reveal">${esc(t.intro)}</p></div>
          <dl class="facts">
            <div><dt>Tipo de pesca</dt><dd>${esc(t.type)}</dd></div><div><dt>Escenario habitual</dt><dd>${esc(t.scenario)}</dd></div>
            ${t.gear.slice(0, 2).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            ${t.gear.slice(2).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            <div><dt>Especies habituales</dt><dd>${sp.map((s) => esc(s.name)).join(', ')}</dd></div>
            <div><dt>Productos Vescora</dt><dd>${list.length}</dd></div>
          </dl>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Guía práctica</div><h2 class="h2" style="margin-top:18px">Equipamiento recomendado</h2></div><a class="btn" href="equipamiento?tecnica=${t.id}">Explorar equipamiento de ${esc(t.name)} ${arrow}</a></div>
          ${gearGroups(list, 'tecnica=' + t.id)}
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap intro-grid">
          <div><div class="eyebrow">Consejos</div><h2 class="h2" style="margin-top:18px">Antes del primer lance</h2></div>
          <ol class="tips">${t.tips.map((x) => `<li class="reveal">${esc(x)}</li>`).join('')}</ol>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Especies</div><h2 class="h2" style="margin-top:18px">Qué pescar con ${esc(t.name)}</h2></div></div>
          <div class="tiles tiles--4">${sp.map((s, i) => tile(s, `especies/${s.id}`, s.claim, i)).join('')}</div>
          <div style="margin-top:48px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="equipamiento?tecnica=${t.id}">Explorar equipamiento de ${esc(t.name)} ${arrow}</a><a class="btn btn--ghost" href="tu-equipo?technique=${t.id}"><span>Montar mi equipo</span></a></div>
        </div>
      </section>`,
      ld: [ldCrumbs(ci), { '@context': 'https://schema.org', '@type': 'Article', headline: `${t.name}: equipamiento recomendado`, about: t.name, publisher: { '@type': 'Organization', name: 'VESCORA' } }]
    };
  };

  V.speciesList = () => ({
    title: 'Especies · ¿Qué quieres pescar?',
    description: 'Lubina, jurel, dorada, anjova, calamar y otros cefalópodos y depredadores: técnicas y equipamiento recomendado para cada especie.',
    html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Especies']])}<h1 class="display">¿Qué quieres pescar?</h1><p class="lede">Elige una especie y descubre las técnicas, señuelos y líneas que mejor funcionan para ella.</p></div></section>
      <section class="section" style="padding-top:0"><div class="wrap"><div class="tiles">${D.species.map((s, i) => tile(s, `especies/${s.id}`, s.claim, i)).join('')}</div></div></section>`,
    ld: ldCrumbs([['Inicio', './'], ['Especies']])
  });

  V.species = (id) => {
    const s = SPEC[id];
    if (!s) return V.notFound();
    const list = productsFor('species', id);
    const ci = [['Inicio', './'], ['Especies', 'especies'], [s.name]];
    return {
      title: `${s.name} · Técnicas y equipamiento recomendado`,
      description: `${s.claim} ${s.intro}`.slice(0, 158),
      over: true,
      html: `${pageHero({ eyebrow: s.latin, title: s.name, lede: s.claim, scene: { scene: s.scene, id: 'sp-' + s.id, photo: s.photo }, crumbsHtml: crumbs(ci) })}
      <section class="section">
        <div class="wrap intro-grid">
          <div class="eyebrow">Comportamiento</div>
          <div><p class="big reveal">${esc(s.intro)}</p>
            <div class="block-title" style="margin-top:40px">Técnicas recomendadas</div>
            <div class="chips">${s.techniques.map((t) => `<a class="chip" href="tecnicas/${t}">${esc(TECH[t].name)} ↗</a>`).join('')}</div>
          </div>
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Equipamiento</div><h2 class="h2" style="margin-top:18px">Para pescar ${esc(s.name.toLowerCase())}</h2></div><a class="btn" href="equipamiento?especie=${s.id}">Ver todo ${arrow}</a></div>
          ${gearGroups(list, 'especie=' + s.id)}
        </div>
      </section>
      <section class="section">
        <div class="wrap intro-grid">
          <div><div class="eyebrow">Condiciones</div><h2 class="h2" style="margin-top:18px">Dónde y cuándo</h2><p class="muted" style="margin-top:18px;max-width:30ch">Información práctica para decidir qué equipamiento explorar. Sin enciclopedias.</p></div>
          <dl class="cond">${s.conditions.map(([k, v]) => `<div class="reveal"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </section>
      <section class="section section--forest on-dark">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Tu equipo</div><h2 class="h2" style="margin-top:18px">Monta tu equipo para ${esc(s.name.toLowerCase())}</h2></div></div>
          ${finderHtml({ species: s.id, scenario: '', technique: '', band: '' }, false)}
        </div>
      </section>`,
      ld: ldCrumbs(ci),
      after: (root) => bindFinder(root, { species: s.id })
    };
  };

  V.finder = (q) => {
    const init = { species: q.get('species') || '', scenario: q.get('scenario') || '', technique: q.get('technique') || '', band: q.get('band') || '' };
    if (init.species && !SPEC[init.species]) init.species = '';
    if (init.scenario && !COND[init.scenario]) init.scenario = '';
    if (init.technique && !TECH[init.technique]) init.technique = '';
    if (init.band && !BANDS[init.band]) init.band = '';
    return {
      title: 'Tu equipo · Qué necesito para pescar',
      description: 'Elige especie, escenario, técnica y gramaje: VESCORA te propone un equipo de partida con señuelo, montaje, línea y conexión.',
      html: `<section class="section section--forest on-dark" style="padding-top:calc(var(--header-h) + clamp(48px,7vw,96px));min-height:100svh">
        <div class="wrap">
          ${crumbs([['Inicio', './'], ['Tu equipo']])}
          <div class="head-row"><div><div class="eyebrow">Herramienta para el pescador</div><h1 class="h1" style="margin-top:18px">Tu equipo</h1></div>
          <p class="lede">Una propuesta de partida construida a partir de las relaciones entre producto, técnica, especie y escenario. Ajusta y comparte el enlace.</p></div>
          ${finderHtml(init, true)}
        </div>
      </section>`,
      after: (root) => bindFinder(root, init)
    };
  };

  V.about = () => ({
    title: 'Quiénes somos · Equipment for the wild',
    description: 'VESCORA nace de una idea sencilla: disfrutar de la pesca empieza mucho antes de lanzar el señuelo.',
    over: true,
    html: `${pageHero({ eyebrow: 'Vescora', title: 'Equipment for the wild', scene: { scene: 'forest', id: 'about' }, crumbsHtml: crumbs([['Inicio', './'], ['Vescora']]) })}
      <section class="section">
        <div class="wrap intro-grid">
          <div class="eyebrow">Nuestra historia</div>
          <div class="manifesto__text">
            <p class="reveal">VESCORA nace de una idea sencilla: disfrutar de la pesca empieza mucho antes de lanzar el señuelo.</p>
            <p class="reveal">Empieza al conocer el escenario, elegir correctamente el equipo y confiar en cada lance.</p>
          </div>
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap">
          ${[
            ['Selección', 'No queremos tenerlo todo. Queremos tener lo que funciona. Cada producto entra en el catálogo porque resuelve una situación concreta de pesca, y porque encaja con el resto del equipo.', 'harbor'],
            ['Calidad', 'Materiales que aguantan la sal, el sol y los golpes contra la roca. Anillas, anzuelos y acabados que se revisan antes de llegar a ti.', 'rock'],
            ['Exploración', 'Salir de noche a un puerto, caminar una costa que no conoces, llegar a un río antes que la luz. La pesca es nuestra forma de descubrir lugares.', 'river'],
            ['Naturaleza', 'Pescamos en lugares que queremos seguir encontrando igual. Respeta tallas y vedas, llévate tu basura y deja el sitio mejor de como lo encontraste.', 'forest'],
            ['Cultura de pesca', 'Compartir lo aprendido es parte del juego. El Journal y las guías por técnica y especie nacen para que elijas mejor antes de salir.', 'coast']
          ].map(([t, d, sc], i) => `<div class="manifesto reveal" style="margin-bottom:clamp(56px,8vw,112px);${i % 2 ? 'direction:rtl' : ''}">
            <div style="direction:ltr">${sceneMedia({ scene: sc, id: 'ab' + i }, 'manifesto__media ratio-32', t)}</div>
            <div style="direction:ltr"><div class="pillar__n">0${i + 1}</div><h2 class="h2" style="margin:14px 0 20px">${t}</h2><p class="lede">${d}</p></div>
          </div>`).join('')}
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Filosofía</div><h2 class="h2" style="margin-top:18px">Tres pilares</h2></div><a class="link-arrow" href="vescora/filosofia">Leer filosofía ${arrow}</a></div>
          ${pillars()}
        </div>
      </section>
      <section class="section section--dark on-dark">
        <div class="wrap" style="text-align:center">
          <p class="h2" style="max-width:20ch;margin:0 auto 32px">Hoy, la pesca. Mañana, cualquier lugar fuera del camino.</p>
          <a class="btn btn--light" href="equipamiento">Explorar equipamiento ${arrow}</a>
        </div>
      </section>`,
    ld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Quiénes somos · VESCORA' }
  });

  V.philosophy = () => ({
    title: 'Filosofía · Calidad, exploración y precisión',
    description: 'Los tres pilares de VESCORA: calidad, exploración y precisión.',
    html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Vescora', 'vescora'], ['Filosofía']])}<h1 class="display">Filosofía</h1><p class="lede">Tres ideas que guían cada producto que seleccionamos y cada guía que escribimos.</p></div></section>
      ${[
        ['Calidad', 'Equipamiento seleccionado pensando en rendimiento y durabilidad.', 'Un buen equipo es el que no te hace pensar en él. Elegimos materiales que resisten la sal, el sol y el uso continuado, y lo probamos en los escenarios para los que existe.', 'rock'],
        ['Exploración', 'La pesca como forma de descubrir nuevos lugares.', 'Cada técnica te lleva a un sitio distinto: la punta de una escollera, una playa en invierno, un puerto de noche. VESCORA quiere acompañarte a todos ellos.', 'river'],
        ['Precisión', 'Los pequeños detalles marcan la diferencia.', 'El gramaje correcto, un bajo bien elegido, una grapa que no altera el nado. La diferencia entre una buena jornada y otra está muchas veces en lo pequeño.', 'harbor']
      ].map(([t, c, d, sc], i) => `<section class="section ${i % 2 ? 'section--paper2' : ''}"><div class="wrap manifesto">
          ${sceneMedia({ scene: sc, id: 'ph' + i }, 'manifesto__media reveal', t)}
          <div class="reveal reveal-d1"><div class="pillar__n">0${i + 1}</div><h2 class="display" style="margin:16px 0 24px;font-size:clamp(44px,7vw,104px)">${t}</h2><p class="lede" style="color:var(--ink)">${c}</p><p class="muted" style="margin-top:18px;max-width:46ch">${d}</p></div>
        </div></section>`).join('')}`
  });

  V.journal = (q) => {
    const c = q.get('categoria') || '';
    const list = D.journal.filter((a) => !c || a.cat === c);
    const cats = D.journalCats.filter((x) => D.journal.some((a) => a.cat === x));
    return {
      title: 'Journal · Guías, técnicas y consejos de pesca',
      description: 'VESCORA Journal: guías de pesca, técnicas, señuelos, especies, equipamiento y consejos para salir mejor preparado.',
      html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Journal']])}<h1 class="display">Journal</h1><p class="lede">Guías prácticas para decidir qué utilizar antes de salir a pescar.</p>
        <div class="chips chips--scroll" style="margin-top:36px"><a class="chip ${!c ? 'is-active' : ''}" href="journal">Todo</a>${cats.map((x) => `<a class="chip ${c === x ? 'is-active' : ''}" href="journal?categoria=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div></div></section>
        <section class="section" style="padding-top:0"><div class="wrap"><div class="jgrid ${c ? '' : 'jgrid--feature'}">${list.map(jcard).join('')}</div></div></section>`,
      ld: ldCrumbs([['Inicio', './'], ['Journal']])
    };
  };

  V.article = (slug) => {
    const a = ART[slug];
    if (!a) return V.notFound();
    const ci = [['Inicio', './'], ['Journal', 'journal'], [a.title]];
    const prods = (a.products || []).map((id) => PROD[id]).filter(Boolean);
    const body = a.body.map(([k, v]) => (k === 'h' ? `<h2>${esc(v)}</h2>` : k === 'ul' ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(v)}</p>`)).join('');
    return {
      title: a.title,
      description: a.excerpt,
      over: true,
      html: `${pageHero({ eyebrow: `${a.cat} · ${a.read} min de lectura`, title: a.title, lede: a.excerpt, scene: { scene: a.scene, id: a.slug, photo: a.photo }, crumbsHtml: crumbs(ci) })}
        <section class="section"><article class="wrap"><div class="article">${body}
          ${(a.techniques.length || a.species.length) ? `<div class="chips" style="margin-top:48px">${a.techniques.map((t) => `<a class="chip" href="tecnicas/${t}">${esc(TECH[t].name)}</a>`).join('')}${a.species.map((s) => `<a class="chip" href="especies/${s}">${esc(SPEC[s].name)}</a>`).join('')}</div>` : ''}
        </div></article></section>
        ${prods.length ? `<section class="section section--paper2"><div class="wrap"><div class="head-row reveal"><div><div class="eyebrow">En este artículo</div><h2 class="h2" style="margin-top:18px">Equipamiento mencionado</h2></div></div><div class="rail">${prods.map(card).join('')}</div></div></section>` : ''}
        <section class="section"><div class="wrap"><div class="head-row"><h2 class="h3" style="text-transform:uppercase">Sigue leyendo</h2><a class="link-arrow" href="journal">Journal ${arrow}</a></div><div class="jgrid">${D.journal.filter((x) => x.slug !== a.slug).slice(0, 3).map(jcard).join('')}</div></div></section>`,
      ld: [ldCrumbs(ci), { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, articleSection: a.cat, publisher: { '@type': 'Organization', name: 'VESCORA' } }]
    };
  };

  V.contact = (q) => {
    const motivo = q.get('motivo') || '';
    const producto = q.get('producto') || '';
    const motivos = [['producto', 'Consulta sobre un producto'], ['disponibilidad', 'Disponibilidad'], ['colaboracion', 'Colaboraciones'], ['prensa', 'Prensa'], ['otro', 'Otro']];
    return {
      title: 'Contacto · Hablemos',
      description: 'Escríbenos para resolver dudas sobre equipamiento, disponibilidad o colaboraciones.',
      html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Contacto']])}<h1 class="display">Hablemos</h1><p class="lede">Dudas sobre un producto, sobre qué equipo elegir o sobre dónde encontrarlo. Te respondemos personalmente.</p></div></section>
      <section class="section" style="padding-top:0"><div class="wrap contact">
        <form class="form" id="contact-form" novalidate>
          <div class="field"><label for="c-name">Nombre</label><input id="c-name" name="nombre" autocomplete="name" required></div>
          <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="c-motivo">Motivo</label><select id="c-motivo" name="motivo" required><option value="">Selecciona un motivo</option>${motivos.map(([v, t]) => `<option value="${v}" ${motivo === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="field"><label for="c-msg">Mensaje</label><textarea id="c-msg" name="mensaje" required>${producto ? esc(`Hola, me gustaría saber la disponibilidad de VESCORA ${producto}.`) : ''}</textarea></div>
          <label class="field field--check"><input type="checkbox" name="privacidad" required><span>He leído y acepto la <a href="legal/privacidad">política de privacidad</a>.</span></label>
          <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><button class="btn" type="submit">Enviar consulta ${arrow}</button><p class="form__status" role="status"></p></div>
        </form>
        <aside class="contact__aside"><dl>
          <div><dt>Email</dt><dd><a href="mailto:${esc(D.site.email)}">${esc(D.site.email)}</a></dd></div>
          <div><dt>Instagram</dt><dd><a href="${esc(D.site.instagram)}" target="_blank" rel="noopener">${esc(D.site.instagramHandle)} ${ext}</a></dd></div>
          ${D.site.whatsapp ? `<div><dt>WhatsApp</dt><dd><a href="${esc(D.site.whatsapp)}" target="_blank" rel="noopener">Escríbenos ${ext}</a></dd></div>` : ''}
          <div><dt>Compras</dt><dd style="font-size:16px;font-family:var(--font-body);font-weight:400;color:var(--graphite)">VESCORA funciona como catálogo. Las compras se realizan en plataformas externas como Wallapop o Vinted.</dd></div>
        </dl></aside>
      </div></section>`,
      after: (root) => {
        const form = $('#contact-form', root);
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const st = $('.form__status', form);
          if (!form.checkValidity()) {
            const bad = form.querySelector(':invalid');
            st.textContent = 'Revisa los campos marcados: todos son necesarios.';
            bad && bad.focus();
            return;
          }
          const d = Object.fromEntries(new FormData(form));
          const subject = `[VESCORA] ${(motivos.find((m) => m[0] === d.motivo) || [, 'Consulta'])[1]}`;
          const body = `${d.mensaje}\n\n— ${d.nombre} (${d.email})`;
          // Sin backend en esta versión: se abre el cliente de correo con el mensaje preparado.
          window.location.href = `mailto:${D.site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          st.textContent = 'Abriendo tu aplicación de correo con el mensaje preparado…';
        });
      }
    };
  };

  // ——— Legal ———
  const L = D.site.legal;
  const ph = (k) => `<span class="ph">${esc(L[k])}</span>`;
  const LEGAL = {
    'aviso-legal': ['Aviso legal', () => `
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web:</p>
      <ul><li>Titular: ${ph('razonSocial')}</li><li>CIF/NIF: ${ph('nif')}</li><li>Domicilio: ${ph('direccion')}</li><li>Email: ${ph('email')}</li><li>Teléfono: ${ph('telefono')}</li><li>Responsable: ${ph('responsable')}</li><li>Dominio: ${ph('dominio')}</li><li>Datos registrales: ${ph('registro')}</li></ul>
      <h2>Objeto</h2><p>Este sitio web es un catálogo digital e informativo de la marca VESCORA. <strong>No procesa pagos ni realiza ventas</strong>. Las compras de los productos mostrados se realizan, en su caso, en plataformas externas (por ejemplo, Wallapop o Vinted), sujetas a sus propias condiciones.</p>
      <h2>Condiciones de uso</h2><p>El acceso al sitio es gratuito e implica la aceptación de este aviso legal. El usuario se compromete a hacer un uso adecuado de los contenidos.</p>
      <h2>Responsabilidad</h2><p>El titular procura que la información del catálogo sea precisa, pero las especificaciones, imágenes y disponibilidad pueden cambiar. Los enlaces a sitios de terceros se ofrecen a título informativo y el titular no se responsabiliza de sus contenidos o condiciones.</p>
      <h2>Legislación aplicable</h2><p>Este aviso se rige por la legislación española. [COMPLETAR: fuero o jurisdicción aplicable, si procede].</p>`],
    privacidad: ['Política de privacidad', () => `
      <h2>Responsable del tratamiento</h2><p>${ph('razonSocial')} · ${ph('nif')} · ${ph('direccion')} · ${ph('email')}</p>
      <h2>Qué datos tratamos</h2><p>Únicamente los que nos facilitas voluntariamente a través del formulario de contacto o por correo electrónico: nombre, email, motivo y mensaje.</p>
      <h2>Finalidad</h2><p>Responder a tu consulta. No se utilizan para decisiones automatizadas ni para elaborar perfiles.</p>
      <h2>Base jurídica</h2><p>Tu consentimiento, otorgado al enviar la consulta (art. 6.1.a RGPD).</p>
      <h2>Conservación</h2><p>Durante el tiempo necesario para atender la consulta y, después, durante los plazos legalmente exigibles. [COMPLETAR plazo concreto].</p>
      <h2>Destinatarios</h2><p>No se ceden datos a terceros salvo obligación legal. [COMPLETAR: proveedor de correo o alojamiento que actúe como encargado del tratamiento].</p>
      <h2>Tus derechos</h2><p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${ph('email')}. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
      <h2>Compras en plataformas externas</h2><p>Cuando accedes a Wallapop, Vinted u otras plataformas desde este sitio, el tratamiento de tus datos se rige por la política de privacidad de dicha plataforma.</p>`],
    cookies: ['Política de cookies', () => `
      <p>Este sitio web <strong>no utiliza cookies propias de análisis ni de publicidad</strong> en su versión actual.</p>
      <h2>Almacenamiento técnico</h2><p>El sitio no instala cookies para su funcionamiento. [COMPLETAR si se incorporan herramientas de analítica o terceros; en ese caso será necesario un banner de consentimiento].</p>
      <h2>Servicios de terceros</h2><p>Las tipografías se cargan desde Google Fonts, lo que implica una conexión con servidores de Google que puede registrar la dirección IP. [REVISAR: valorar el alojamiento local de las tipografías].</p>
      <h2>Enlaces externos</h2><p>Las plataformas externas a las que enlazamos (Wallapop, Vinted, Instagram…) pueden utilizar sus propias cookies, reguladas por sus políticas.</p>`],
    terminos: ['Términos y condiciones', () => `
      <div class="notice">VESCORA funciona actualmente como <strong>catálogo y plataforma informativa</strong>. Este sitio no vende productos, no procesa pagos ni gestiona pedidos.</div>
      <h2>Información de producto</h2><p>Las descripciones, especificaciones, recomendaciones de uso e ilustraciones tienen carácter orientativo. Las recomendaciones de técnica, especie y condiciones no garantizan resultados de pesca.</p>
      <h2>Compras</h2><p>Las compras se realizan en plataformas externas. Precio, envío, pago, devoluciones y garantías se rigen por las condiciones de cada plataforma y del anuncio correspondiente.</p>
      <h2>Pesca responsable</h2><p>El usuario es responsable de cumplir la normativa de pesca recreativa aplicable (licencias, tallas mínimas, vedas y zonas protegidas) y de practicar la actividad con seguridad.</p>
      <h2>Modificaciones</h2><p>El titular puede actualizar estos términos. Última actualización: ${ph('actualizado')}.</p>`],
    'propiedad-intelectual': ['Propiedad intelectual', () => `
      <p>La marca VESCORA, sus logotipos, diseño, textos, ilustraciones y fotografías de este sitio son titularidad de ${ph('razonSocial')} o se utilizan con autorización, y están protegidos por la normativa de propiedad intelectual e industrial.</p>
      <h2>Usos no permitidos</h2><p>Queda prohibida la reproducción, distribución, comunicación pública o transformación de los contenidos sin autorización expresa y por escrito del titular, salvo los usos permitidos por la ley.</p>
      <h2>Marcas de terceros</h2><p>Los nombres de plataformas externas (Wallapop, Vinted, Instagram y otras) son marcas de sus respectivos titulares y se citan con fines informativos.</p>
      <h2>Contacto</h2><p>Para solicitar autorizaciones o comunicar un posible uso indebido: ${ph('email')}.</p>`]
  };
  V.legal = (id) => {
    const l = LEGAL[id];
    if (!l) return V.notFound();
    return {
      title: l[0],
      description: `${l[0]} de VESCORA. Sitio web de catálogo e información; las compras se realizan en plataformas externas.`,
      html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Legal'], [l[0]]])}<h1 class="h1">${l[0]}</h1></div></section>
        <section class="section" style="padding-top:0"><div class="wrap">
          <nav class="legal-nav" aria-label="Páginas legales">${Object.entries(LEGAL).map(([k, v]) => `<a class="chip ${k === id ? 'is-active' : ''}" href="legal/${k}">${v[0]}</a>`).join('')}</nav>
          <div class="legal">${l[1]()}<p class="small muted" style="margin-top:48px">Texto base pendiente de completar y revisar por asesoría legal. Los campos resaltados deben sustituirse por los datos reales del titular.</p></div>
        </div></section>`,
      noindex: true
    };
  };

  // ——— Búsqueda ———
  let INDEX;
  function buildIndex() {
    INDEX = [];
    D.products.forEach((p) => INDEX.push({ type: 'Productos', title: 'VESCORA ' + p.name, sub: `${p.type} · ${specLine(p)}`, url: pUrl(p), p, text: norm([p.name, p.type, p.summary, CAT[p.category].name, subName(p), p.length, p.weight != null ? p.weight + ' g' : '', Object.values(p.specs).join(' '), p.techniques.map((t) => TECH[t].name).join(' '), p.species.map((s) => SPEC[s].name).join(' '), p.conditions.map((c) => COND[c].name).join(' ')].join(' ')), key: norm(p.name + ' ' + p.type + ' ' + subName(p)) }));
    D.techniques.forEach((t) => INDEX.push({ type: 'Técnicas', title: t.name, sub: t.claim, url: 'tecnicas/' + t.id, o: t, text: norm([t.name, t.claim, t.intro, t.scenario].join(' ')), key: norm(t.name) }));
    D.species.forEach((s) => INDEX.push({ type: 'Especies', title: s.name, sub: s.claim, url: 'especies/' + s.id, o: s, text: norm([s.name, s.latin, s.claim, s.intro].join(' ')), key: norm(s.name) }));
    D.categories.forEach((c) => {
      INDEX.push({ type: 'Categorías', title: c.name, sub: c.claim, url: 'equipamiento/' + c.id, text: norm(c.name + ' ' + c.intro), key: norm(c.name) });
      c.sub.forEach((s) => INDEX.push({ type: 'Categorías', title: `${c.name} · ${s.name}`, sub: c.name, url: `equipamiento/${c.id}?tipo=${s.id}`, text: norm(s.name + ' ' + c.name), key: norm(s.name) }));
    });
    D.journal.forEach((a) => INDEX.push({ type: 'Journal', title: a.title, sub: `${a.cat} · ${a.read} min`, url: 'journal/' + a.slug, o: a, text: norm([a.title, a.excerpt, a.cat, a.body.map((b) => [].concat(b[1]).join(' ')).join(' ')].join(' ')), key: norm(a.title) }));
  }
  function search(q) {
    if (!INDEX) buildIndex();
    const toks = norm(q).split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/s$/, ''));
    if (!toks.length) return [];
    return INDEX.map((it) => {
      let sc = 0;
      for (const t of toks) {
        if (it.key.includes(t)) sc += 5;
        else if (it.text.includes(t)) sc += 2;
        else if (/^\d+g$/.test(t) && it.p && it.p.weight != null && Math.abs(it.p.weight - parseFloat(t)) <= 3) sc += 2;
        else return null;
      }
      return { it, sc };
    }).filter(Boolean).sort((a, b) => b.sc - a.sc).map((x) => x.it);
  }
  function resultsHtml(q) {
    const res = search(q);
    if (!q.trim()) return '';
    if (!res.length) return `<p class="muted">Sin resultados para «${esc(q)}». Prueba con una especie, una técnica o un tipo de señuelo.</p>`;
    const groups = ['Productos', 'Técnicas', 'Especies', 'Categorías', 'Journal'];
    const thumb = (it) => it.p ? A.product(it.p) : it.o && it.o.scene ? A.scene(it.o.scene, { seed: it.o.id || it.o.slug, label: it.title }) : '';
    const col = (gs) => gs.map((g) => {
      const items = res.filter((r) => r.type === g).slice(0, g === 'Productos' ? 8 : 5);
      return items.length ? `<div class="search__group"><h3>${g} · ${res.filter((r) => r.type === g).length}</h3>${items.map((it) => `<a class="result" href="${it.url}"><span class="result__media">${thumb(it)}</span><span><strong>${esc(it.title)}</strong><span class="small muted">${esc(it.sub)}</span></span>${arrow}</a>`).join('')}</div>` : '';
    }).join('');
    return `<div>${col(groups.slice(0, 1))}</div><div style="display:grid;gap:40px;align-content:start">${col(groups.slice(1))}</div>`;
  }
  V.search = (q) => {
    const s = q.get('q') || '';
    return {
      title: s ? `Buscar: ${s}` : 'Buscar',
      description: 'Busca productos, técnicas, especies, categorías y artículos de VESCORA.',
      noindex: true,
      html: `<section class="page-head"><div class="wrap">${crumbs([['Inicio', './'], ['Buscar']])}<h1 class="h1">Buscar</h1>
        <form class="search__field" role="search" action="buscar" data-search-page><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><label class="sr-only" for="sp-q">Buscar</label><input id="sp-q" name="q" value="${esc(s)}" placeholder="lubina, spinning, vinilo 15g…" autocomplete="off"></form>
        <div class="search__results">${resultsHtml(s)}</div></div></section>`,
      after: (root) => {
        const inp = $('#sp-q', root), out = $('.search__results', root);
        inp.addEventListener('input', () => { out.innerHTML = resultsHtml(inp.value); history.replaceState(null, '', 'buscar?q=' + encodeURIComponent(inp.value)); });
        $('[data-search-page]', root).addEventListener('submit', (e) => e.preventDefault());
      }
    };
  };

  V.notFound = () => ({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    noindex: true,
    over: true,
    html: `${pageHero({ eyebrow: 'Error 404', title: 'Fuera del camino', lede: 'Esta página no existe o se ha movido. Vuelve al inicio o explora el equipamiento.', scene: { scene: 'night', id: '404' }, extra: '<div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--light" href="./">Volver al inicio</a><a class="btn btn--ghost" href="equipamiento"><span>Equipamiento</span></a></div>' })}`
  });

  // ——— Router ———
  function route(path, q) {
    const s = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).map(decodeURIComponent);
    const [a, b, c] = s;
    if (!a) return V.home();
    if (a === 'equipamiento') return c ? V.product(b, c) : V.catalog(b, q);
    if (a === 'tecnicas') return b ? V.technique(b) : V.techniques();
    if (a === 'especies') return b ? V.species(b) : V.speciesList();
    if (a === 'tu-equipo' && !b) return V.finder(q);
    if (a === 'vescora') return b === 'filosofia' ? V.philosophy() : b ? V.notFound() : V.about();
    if (a === 'journal') return b ? V.article(b) : V.journal(q);
    if (a === 'contacto' && !b) return V.contact(q);
    if (a === 'legal') return V.legal(b);
    if (a === 'buscar') return V.search(q);
    return V.notFound();
  }

  function currentPath() {
    let p = location.pathname;
    if (p.startsWith(BASE)) p = p.slice(BASE.length);
    return p.replace(/index\.html$/, '');
  }

  function setMeta(v, path) {
    document.title = v.title.includes('VESCORA') ? v.title : `${v.title} · VESCORA`;
    const set = (sel, attr, val) => { let el = $(sel); if (!el) { el = document.createElement('meta'); const [k, n] = sel.match(/\[(\w+)="([^"]+)"\]/).slice(1); el.setAttribute(k, n); document.head.appendChild(el); } el.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', v.description);
    set('meta[property="og:title"]', 'content', document.title);
    set('meta[property="og:description"]', 'content', v.description);
    set('meta[name="robots"]', 'content', v.noindex ? 'noindex, follow' : 'index, follow');
    const canon = $('link[rel="canonical"]');
    if (canon) canon.href = D.site.domain + '/' + path;
    $('#ld-page').textContent = v.ld ? JSON.stringify(v.ld) : '';
  }

  let io, overHero = false;
  function render(opts = {}) {
    const q = new URLSearchParams(location.search);
    const path = currentPath();
    const v = route(path, q);
    const main = $('#main');
    main.innerHTML = `<div class="view">${v.html}</div>`;
    setMeta(v, path);
    overHero = !!v.over;
    onScroll();
    // Navegación activa
    const top = path.split('/')[0];
    $$('.nav a').forEach((a) => (a.getAttribute('href') === top ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    if (v.after) v.after(main);
    // Aparición progresiva
    if (io) io.disconnect();
    if ('IntersectionObserver' in window && !reduced) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
      $$('.reveal', main).forEach((el) => io.observe(el));
    } else $$('.reveal', main).forEach((el) => el.classList.add('is-in'));
    if (!opts.keepScroll) {
      if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
      else window.scrollTo(0, 0);
    }
    if (opts.focus) main.focus({ preventScroll: true });
  }

  function navigate(href, opts = {}) {
    closeAll();
    const u = new URL(href, document.baseURI);
    if (u.pathname === location.pathname && u.search === location.search && u.hash) {
      const t = $(u.hash);
      if (t) { history.pushState(null, '', u.href); t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
    }
    history.pushState(null, '', u.href);
    render(Object.assign({ focus: true }, opts));
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (/^(mailto:|tel:|https?:)/.test(href) && !href.startsWith(location.origin)) return;
    const u = new URL(a.href);
    if (u.origin !== location.origin || !u.pathname.startsWith(BASE) || /\.(jpg|png|webp|svg|pdf)$/.test(u.pathname)) return;
    e.preventDefault();
    navigate(a.href);
  });
  window.addEventListener('popstate', () => render({ keepScroll: false }));

  // ——— Header: sticky, reducción y parallax ———
  const header = $('#header');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-over', overHero && y < 40 && !document.body.classList.contains('is-locked'));
    const px = $('[data-parallax]');
    if (px && !reduced && y < window.innerHeight * 1.2) px.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ——— Overlays: menú y buscador ———
  const menu = $('#menu'), srch = $('#search');
  menu.hidden = false; srch.hidden = false;
  menu.setAttribute('aria-hidden', 'true'); srch.setAttribute('aria-hidden', 'true');
  const closeBtn = (label) => `<button class="icon-btn" type="button" data-close aria-label="Cerrar ${label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>`;
  const lines = D.site.lines.filter((l) => l.active);
  menu.innerHTML = `<div class="wrap"><div class="menu__top"><a class="brand" href="./"><span class="brand__emblem" aria-hidden="true"></span><span class="brand__word">VESCORA</span></a>${closeBtn('menú')}</div>
    <div class="menu__grid">
      <nav class="menu__main" aria-label="Menú principal">${[['Equipamiento', 'equipamiento'], ['Técnicas', 'tecnicas'], ['Especies', 'especies'], ['Tu equipo', 'tu-equipo'], ['Vescora', 'vescora'], ['Journal', 'journal'], ['Contacto', 'contacto']].map(([t, u], i) => `<a href="${u}"><small>0${i + 1}</small>${t}</a>`).join('')}</nav>
      <div class="menu__cols">
        <div><h4>Equipamiento${lines.length > 1 ? '' : ' · ' + esc(lines[0].name)}</h4>${D.categories.map((c) => `<a href="equipamiento/${c.id}">${esc(c.name)}</a>`).join('')}</div>
        <div><h4>Técnicas</h4>${D.techniques.map((t) => `<a href="tecnicas/${t.id}">${esc(t.name)}</a>`).join('')}</div>
        <div><h4>Especies</h4>${D.species.map((s) => `<a href="especies/${s.id}">${esc(s.name)}</a>`).join('')}</div>
        <div><h4>Vescora</h4><a href="vescora">Quiénes somos</a><a href="vescora/filosofia">Filosofía</a><a href="journal">Journal</a></div>
        <div><h4>Síguenos</h4><a href="${esc(D.site.instagram)}" target="_blank" rel="noopener">Instagram ${ext}</a><a href="mailto:${esc(D.site.email)}">${esc(D.site.email)}</a></div>
      </div>
    </div></div>`;
  const suggestions = ['lubina', 'spinning', 'vinilo 15g', 'jurel', 'rockfishing', 'fluorocarbono', 'calamar'];
  srch.innerHTML = `<div class="wrap"><div class="search__top"><span class="eyebrow">Buscar en Vescora</span>${closeBtn('buscador')}</div>
    <div class="search__body">
      <form class="search__field" role="search" action="buscar" id="search-form"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><label class="sr-only" for="q">Buscar productos, técnicas, especies o artículos</label><input id="q" name="q" placeholder="¿Qué buscas?" autocomplete="off"></form>
      <div class="chips search__hint">${suggestions.map((s) => `<button type="button" class="chip" data-suggest="${s}">${s}</button>`).join('')}</div>
      <div class="search__results" id="search-results"></div>
    </div></div>`;
  const qInput = $('#q');
  qInput.addEventListener('input', () => { $('#search-results').innerHTML = resultsHtml(qInput.value); });
  $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); if (qInput.value.trim()) navigate('buscar?q=' + encodeURIComponent(qInput.value.trim())); });
  srch.addEventListener('click', (e) => { const b = e.target.closest('[data-suggest]'); if (b) { qInput.value = b.dataset.suggest; qInput.dispatchEvent(new Event('input')); qInput.focus(); } });

  let lastFocus = null;
  function open(el) {
    closeAll();
    lastFocus = document.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $(`[data-open="${el.id}"]`).setAttribute('aria-expanded', 'true');
    header.classList.remove('is-over');
    setTimeout(() => (el === srch ? qInput : $('[data-close]', el)).focus(), 60);
  }
  function closeAll() {
    [menu, srch].forEach((el) => {
      if (!el.classList.contains('is-open')) return;
      el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
      $(`[data-open="${el.id}"]`).setAttribute('aria-expanded', 'false');
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    });
    document.body.classList.remove('is-locked');
    onScroll();
  }
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => open(b.dataset.open === 'menu' ? menu : srch)));
  document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeAll(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(srch); }
    // Mantener el foco dentro del overlay abierto
    const openEl = [menu, srch].find((el) => el.classList.contains('is-open'));
    if (openEl && e.key === 'Tab') {
      const f = $$('a[href], button, input', openEl);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ——— Arranque ———
  // Redirección desde 404.html (hosting estático): ?p=/ruta
  const redirect = new URLSearchParams(location.search).get('p');
  if (redirect) history.replaceState(null, '', BASE + redirect.replace(/^\//, ''));
  $('#year').textContent = new Date().getFullYear();
  render({ keepScroll: !!location.hash });
  if (location.hash) setTimeout(() => { const t = $(location.hash); t && t.scrollIntoView(); }, 50);
})();
