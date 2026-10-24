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
  // Menú principal (las mismas cinco entradas que el header de index.html) y rutas de sección.
  const NAV = [['Equipamiento', 'equipamiento'], ['Técnicas y especies', 'tecnicas-y-especies'], ['Encuentra tu equipo', 'encuentra-tu-equipo'], ['Vescora', 'vescora'], ['Contacto', 'contacto']];
  const TS = 'tecnicas-y-especies';
  const FINDER = 'encuentra-tu-equipo';

  // ——— Media: fotografía real si existe; si no, ilustración ———
  function sceneMedia(o, cls = '', label) {
    const alt = label || o.alt || o.name || o.title || 'VESCORA';
    const inner = o.photo
      ? `<img src="${esc(o.photo)}" alt="${esc(alt)}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
      : A.scene(o.scene || 'coast', { label: alt, seed: o.id || o.slug, flip: o.flip });
    return `<div class="media grain ${cls}">${inner}</div>`;
  }
  const prodArt = (p) => (p.photo ? `<img src="${esc(p.photo)}" alt="${esc('VESCORA ' + p.name)}" loading="lazy" decoding="async">` : A.product(p));

  // Los recuadros con foto toman el color de fondo de la propia foto para que la imagen encaje sin bordes.
  function paintBg(box) {
    const img = box && $('img', box);
    if (!img) return;
    img.loading = 'eager';
    const paint = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 1;
        const x = c.getContext('2d'); x.drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
        const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
        box.style.background = `rgb(${r},${g},${b})`;
      } catch (e) { /* se mantiene el fondo claro por defecto */ }
    };
    img.complete && img.naturalWidth ? paint() : img.addEventListener('load', paint, { once: true });
  }

  function specLine(p) {
    const s = [p.length, p.specs.Peso || p.specs['Acción de lance']].filter((x) => x && x !== '—');
    return s.join(' · ');
  }

  // El precio solo aparece si el producto tiene un precio real (`price`).
  const fmtPrice = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

  function card(p, i = 0) {
    const tech = p.techniques[0] ? TECH[p.techniques[0]].name : '';
    return `<a class="card reveal reveal-d${i % 4}" href="${pUrl(p)}">
      <div class="card__media">${prodArt(p)}<span class="card__tag">${esc(subName(p))}</span></div>
      <div class="card__body">
        <div class="card__name">${esc(p.name)}</div>
        <div class="card__type">${esc(p.type)}</div>
        <div class="card__spec">${esc(specLine(p))}</div>
        ${typeof p.price === 'number' ? `<div class="card__price">${fmtPrice(p.price)}</div>` : ''}
        <div class="card__foot"><span class="tag tech">${esc(tech)}</span><span class="link-arrow">Explorar ${arrow}</span></div>
      </div>
    </a>`;
  }

  const crumbs = (items) => `<nav class="crumbs" aria-label="Migas de pan">${items.map(([t, u], i) => (i ? '<span aria-hidden="true">/</span>' : '') + (u ? `<a href="${u}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`)).join('')}</nav>`;
  const ldCrumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: D.site.domain + '/' + (u || '').replace(/^\.\//, '') })) });

  function pageHero({ eyebrow, title, lede, scene, crumbsHtml = '', extra = '', solid = false }) {
    return `<section class="page-hero${solid ? ' page-hero--solid' : ''}">
      ${solid ? '' : `<div class="page-hero__media">${sceneMedia(scene, '', title)}</div>`}
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

  // ——— Tipo de agua: dimensión transversal (nunca es una pregunta del recomendador) ———
  const WATERS = D.site.waterTypes;
  const WATER = by(WATERS);
  const WATER_BY_Q = Object.fromEntries(WATERS.flatMap((w) => [[w.q, w], [w.slug, w]]));
  const ALL_WATER = WATERS.map((w) => w.id);
  const isWaterSlug = (x) => WATERS.some((w) => w.slug === x);
  // Sin `waterTypes` declarado, una entidad se considera válida en cualquier agua.
  const wOf = (o) => (o && o.waterTypes && o.waterTypes.length ? o.waterTypes : ALL_WATER);
  const inWater = (o, ws) => !ws || wOf(o).some((w) => ws.includes(w));
  // Contexto de agua = intersección de los tipos de agua de las entidades elegidas.
  const ctxWater = (...ents) => ents.filter(Boolean).reduce((acc, e) => acc.filter((w) => wOf(e).includes(w)), ALL_WATER);
  const waterNames = (o) => wOf(o).map((w) => WATER[w].name).join(' · ');
  const waterParam = (q) => WATER_BY_Q[q.get('agua') || ''] || null;
  const withWater = (href, w) => (w ? href + (href.includes('?') ? '&' : '?') + 'agua=' + w.q : href);
  const singleWater = (o) => (wOf(o).length === 1 ? WATER[wOf(o)[0]] : null);
  function waterSwitch(current, hrefFor, label = 'Todas las aguas') {
    return `<div class="chips water-switch" role="group" aria-label="Tipo de agua">${[null].concat(WATERS).map((w) => `<a class="chip ${(current && w && current.id === w.id) || (!current && !w) ? 'is-active' : ''}" href="${hrefFor(w)}">${esc(w ? w.name : label)}</a>`).join('')}</div>`;
  }

  // ——— "Tu equipo" ———
  const BANDS = { 'b1': ['Hasta 10 g', 0, 10], 'b2': ['10 – 20 g', 10, 20], 'b3': ['20 – 40 g', 20, 40], 'b4': ['Más de 40 g', 40, 999] };
  // Escenarios de una especie: los declarados en la especie + los deducidos de sus productos, en su tipo de agua.
  function scenariosFor(speciesId) {
    const sp = SPEC[speciesId];
    const set = new Set(sp.scenarios || []);
    productsFor('species', speciesId).forEach((p) => p.conditions.forEach((c) => set.add(c)));
    return D.conditions.filter((c) => c.scenario && set.has(c.id) && inWater(c, wOf(sp)));
  }
  // Técnicas válidas: las de la especie compatibles con el agua de especie + escenario.
  function techniquesFor(state) {
    if (!state.species) return [];
    const ws = ctxWater(SPEC[state.species], COND[state.scenario]);
    return SPEC[state.species].techniques.map((t) => TECH[t]).filter((t) => t && inWater(t, ws));
  }
  const kitWater = (s) => ctxWater(SPEC[s.species], COND[s.scenario], TECH[s.technique]);
  const lureSlot = D.site.kitSlots.find((x) => x.lure);
  function slotPool(slot, s, ws) {
    return D.products.filter((p) => p.category === slot.category && p.techniques.includes(s.technique) && inWater(p, ws)
      && (!slot.subs || slot.subs.includes(p.sub)) && (!slot.species || p.species.includes(s.species)));
  }
  // El peso de lance solo se pregunta si algún señuelo compatible tiene peso (no aplica a mosca o carpfishing).
  const needsBand = (s) => !!(s.species && s.technique && lureSlot && slotPool(lureSlot, s, kitWater(s)).some((p) => p.weight != null));
  function buildKit(s) {
    const ws = kitWater(s);
    const band = needsBand(s) ? BANDS[s.band] : null;
    const [, lo, hi] = band || [null, 0, 999];
    const mid = (lo + Math.min(hi, 80)) / 2;
    const fit = (w) => (w == null || !band ? 0 : w >= lo && w <= hi ? 3 : -Math.min(3, Math.abs(w - mid) / 10));
    const rank = (list, extra = () => 0) => list
      .map((p, i) => ({ p, i, sc: (p.species.includes(s.species) ? 4 : 0) + (p.conditions.includes(s.scenario) ? 2 : 0) + extra(p) }))
      .sort((a, b) => b.sc - a.sc || a.i - b.i).map((x) => x.p);
    const kit = [];
    let hasLure = false;
    D.site.kitSlots.forEach((slot) => {
      if (slot.ifNoLure && hasLure) return;
      if (slot.lure) {
        const lures = rank(slotPool(slot, s, ws), (p) => fit(p.weight));
        if (!lures[0]) return;
        hasLure = true;
        kit.push([slot.role, lures[0]]);
        if (lures[0].pairs) {
          const heads = lures[0].pairs.map((id) => PROD[id]).filter((h) => h && inWater(h, ws)).sort((a, b) => fit(b.weight) - fit(a.weight) || Math.abs(a.weight - mid) - Math.abs(b.weight - mid));
          if (heads[0]) kit.push(['Cabeza plomada', heads[0]]);
        }
        if (lures[1]) kit.push(['Alternativa', lures[1]]);
        return;
      }
      const extra = slot.rod && band ? (p) => (p.weightRange && p.weightRange[0] <= hi && p.weightRange[1] >= lo ? 3 : 0) : undefined;
      const best = rank(slotPool(slot, s, ws), extra)[0];
      if (best) kit.push([slot.role, best]);
    });
    return kit;
  }

  function finderHtml(state, full) {
    const scen = state.species ? scenariosFor(state.species) : [];
    const techs = techniquesFor(state);
    const bandOn = needsBand(state);
    const pill = (step, val, label) => `<button type="button" class="chip" data-step="${step}" data-val="${val}" aria-pressed="${state[step] === val}">${esc(label)}</button>`;
    const step = (n, key, label, opts, enabled) => `<div class="step ${enabled ? '' : 'is-disabled'}"><div class="step__label"><span>0${n}</span><strong>${label}</strong></div><div class="chips">${opts}</div></div>`;
    // Las especies se agrupan visualmente por tipo de agua; no es una pregunta adicional.
    const speciesOpts = WATERS.map((w) => {
      const list = D.species.filter((x) => wOf(x).includes(w.id));
      return list.length ? `<div class="chips__group"><span class="chips__label">${esc(w.name)}</span>${list.map((x) => pill('species', x.id, x.name)).join('')}</div>` : '';
    }).join('');
    const ready = state.species && state.scenario && state.technique && (state.band || !bandOn);
    let kitHtml;
    if (ready) {
      const kit = buildKit(state);
      const params = Object.fromEntries(Object.entries(state).filter(([k, v]) => v && (k !== 'band' || bandOn)));
      const q = new URLSearchParams(params).toString();
      const ws = kitWater(state);
      const path = [SPEC[state.species].name, COND[state.scenario].name, TECH[state.technique].name].concat(bandOn ? [BANDS[state.band][0]] : []);
      kitHtml = `<p class="kit__path">${path.map(esc).join(' → ')}${ws.length === 1 ? ` <span class="kit__water">${esc(WATER[ws[0]].name)}</span>` : ''}</p>
        ${kit.length ? `<ul class="kit__list">${kit.map(([role, p]) => `<li><a href="${pUrl(p)}"><span class="thumb">${prodArt(p)}</span><span><span class="kit__role">${esc(role)}</span><strong>${esc(p.name)}</strong><span class="small muted">${esc(specLine(p))}</span></span>${arrow}</a></li>`).join('')}</ul>` : `<p class="kit__empty">Todavía no hay equipamiento VESCORA para esta combinación. <a class="link-arrow" href="contacto">Pregúntanos ${arrow}</a></p>`}
        <div class="kit__foot"><a class="link-arrow" href="${withWater(`tecnicas/${state.technique}`, ws.length === 1 ? WATER[ws[0]] : null)}">Guía de ${esc(TECH[state.technique].name)} ${arrow}</a>${full ? '' : `<a class="link-arrow" href="${FINDER}?${q}">Abrir y compartir ${arrow}</a>`}</div>`;
    } else {
      kitHtml = `<p class="kit__empty">Responde a las preguntas y VESCORA te propondrá un equipo de partida: señuelo o cebo, montaje, línea, caña y carrete.</p>`;
    }
    const bandOpts = !state.technique || bandOn
      ? Object.entries(BANDS).map(([k, v]) => pill('band', k, v[0])).join('')
      : '<span class="small" style="opacity:.6">No aplica a esta técnica</span>';
    return `<div class="finder" data-finder data-full="${full ? 1 : 0}">
      <div class="finder__steps">
        ${step(1, 'species', 'Quiero pescar', speciesOpts, true)}
        ${step(2, 'scenario', 'Escenario', scen.map((x) => pill('scenario', x.id, x.name)).join('') || '<span class="small" style="opacity:.6">Elige una especie</span>', !!state.species)}
        ${step(3, 'technique', 'Técnica', techs.map((x) => pill('technique', x.id, x.name)).join('') || '<span class="small" style="opacity:.6">Elige una especie</span>', !!state.scenario)}
        ${step(4, 'band', 'Peso de lance', bandOpts, !!state.technique && bandOn)}
      </div>
      <div class="kit" aria-live="polite"><div class="kit__head"><span class="kit__title">TU EQUIPO</span><span class="tag">${ready ? 'Propuesta VESCORA' : 'Pendiente'}</span></div>${kitHtml}</div>
    </div>`;
  }

  // Normaliza el estado: descarta escenario/técnica que ya no son compatibles (especie o tipo de agua).
  function cleanFinder(state) {
    if (!state.species) { state.scenario = ''; state.technique = ''; return state; }
    if (state.scenario && !scenariosFor(state.species).some((c) => c.id === state.scenario)) state.scenario = '';
    if (state.technique && !techniquesFor(state).some((t) => t.id === state.technique)) state.technique = '';
    return state;
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
      cleanFinder(state);
      box.outerHTML = finderHtml(state, full);
      bindFinder(root, state);
      if (full) history.replaceState(null, '', FINDER + (Object.values(state).some(Boolean) ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(state).filter(([, x]) => x))) : ''));
    }, { once: true });
  }

  // ——— Vistas ———
  const V = {};

  // ——— Portada ———
  // New In: si algún producto tiene `addedAt` (fecha real de incorporación), se muestran los más recientes;
  // si no, la selección editorial de `site.home.newIn`. Nunca se inventan fechas.
  function newInProducts() {
    const H = D.site.home || {};
    const dated = D.products.filter((p) => p.addedAt).sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)));
    return (dated.length ? dated : (H.newIn || []).map((id) => PROD[id]).filter(Boolean)).slice(0, H.newInMax || 4);
  }
  // Productos destacados: `featured: true`, sin repetir los que ya salen en New In.
  function featuredProducts(exclude = []) {
    const skip = new Set(exclude.map((p) => p.id));
    return D.products.filter((p) => p.featured && !skip.has(p.id)).slice(0, (D.site.home || {}).featuredMax || 8);
  }
  // Acceso directo al recomendador: no lo duplica, solo lleva a "Encuentra tu equipo".
  function ctaBand(title = 'Encuentra tu equipo', text = 'Elige qué quieres pescar, dónde y con qué técnica. VESCORA cruza tus respuestas con su catálogo y te propone un equipo de partida.') {
    return `<div class="cta-band on-dark reveal">
      <div><div class="eyebrow">Herramienta para el pescador</div><h3 class="cta-band__title">${esc(title)}</h3><p class="cta-band__text">${esc(text)}</p></div>
      <div class="cta-band__actions"><a class="btn btn--light" href="${FINDER}">Encuentra tu equipo ${arrow}</a><a class="btn btn--ghost" href="equipamiento"><span>Ver equipamiento</span></a></div>
    </div>`;
  }

  V.home = () => {
    const newIn = newInProducts();
    const featured = featuredProducts(newIn);
    const ig = [
      ['photo', 'assets/photos/journal-salir-al-amanecer-checklist.webp', 'Primera luz'],
      ['prod', PROD['minnow-kingdom-105s-sardina-azul'], 'Minnow Kingdom 105S'],
      ['photo', 'assets/photos/journal-rockfishing-equipo-basico-para-empezar.webp', 'Costa rocosa'],
      ['prod', PROD['kit-vinilos-40'], 'Kit 40 vinilos'],
      ['photo', 'assets/photos/tecnica-fly-fishing.webp', 'Río arriba'],
      ['photo', 'assets/photos/journal-como-elegir-un-fluorocarbono.webp', 'Fuera del camino']
    ].filter(([, o]) => o);
    const igMedia = (k, o, cap) => (k === 'prod' ? prodArt(o) : `<img src="${esc(o)}" alt="${esc(cap)}" loading="lazy" decoding="async">`);
    return {
      title: 'VESCORA — Equipment for the wild · Equipamiento de pesca',
      description: 'VESCORA: señuelos y equipamiento de pesca para agua dulce y salada. Explora el catálogo o encuentra tu equipo según lo que quieres pescar, dónde y cómo.',
      over: true,
      html: `
      <section class="hero">
        <div class="hero__media" data-parallax>${sceneMedia({ scene: 'dawn', id: 'hero', photo: 'assets/photos/hero-lago-spinning.webp', eager: true }, '', 'Pescador con mochila lanzando desde la orilla de un lago rodeado de pinos')}</div>
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

      ${newIn.length ? `<section class="section section--tight" id="new-in">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Novedades</div><h2 class="h2" style="margin-top:18px">New In</h2></div><a class="link-arrow" href="equipamiento">Ver todo el equipamiento ${arrow}</a></div>
          <div class="collection">${newIn.map(card).join('')}</div>
        </div>
      </section>` : ''}

      ${featured.length ? `<section class="section section--paper2" id="destacados">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Selección Vescora</div><h2 class="h2" style="margin-top:18px">Productos destacados</h2></div><a class="link-arrow" href="equipamiento">Ver todo el catálogo ${arrow}</a></div>
          <div class="grid">${featured.map(card).join('')}</div>
        </div>
      </section>` : ''}

      <section class="section" id="elige">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Te ayudamos a elegir</div><h2 class="h2" style="margin-top:18px">¿No sabes qué señuelo elegir?</h2></div>
            <p class="lede">Encuentra el equipo adecuado para tu próxima jornada.</p></div>
          <div class="routes routes--compact">
            ${[
              ['01', 'Especies', '¿Qué quieres pescar?', 'Lubina, trucha, black bass, calamar… Cada especie pide su señuelo.', 'Ver especies', `${TS}#especies`, { scene: 'boat', id: 'r3', photo: 'assets/photos/ruta-especies.webp' }],
              ['02', 'Técnicas', '¿Dónde y cómo vas a pescar?', 'Costa, río o embalse. Spinning, eging o mosca.', 'Ver técnicas', `${TS}#tecnicas`, { scene: 'coast', id: 'r2', photo: 'assets/photos/ruta-tecnicas.webp' }],
              ['03', 'Equipamiento', '¿Qué necesitas?', 'Señuelo, línea y montaje que encajan con tu jornada.', 'Ver equipamiento', 'equipamiento', { scene: 'harbor', id: 'r1', photo: 'assets/photos/ruta-equipamiento.webp' }]
            ].map(([n, t, q, d, c, u, sc], i) => `<a class="route reveal reveal-d${i}" href="${u}">${sceneMedia(sc, '', t)}<div class="route__body"><div class="route__num">${n} —</div><div class="route__title">${t}</div><p class="route__q">${q}</p><p class="route__t">${d}</p><span class="link-arrow">${c} ${arrow}</span></div></a>`).join('')}
          </div>
          ${ctaBand()}
        </div>
      </section>

      <section class="section section--dark on-dark">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">${esc(D.site.instagramHandle)}</div><h2 class="h2" style="margin-top:18px">Follow the adventure</h2></div><a class="btn btn--ghost" href="${esc(D.site.instagram)}" target="_blank" rel="noopener"><span>Instagram ${ext}</span></a></div>
          <div class="ig">${ig.map(([k, o, cap], i) => `<a class="${k === 'prod' ? 'is-product' : ''} reveal reveal-d${i % 4}" href="${esc(D.site.instagram)}" target="_blank" rel="noopener" aria-label="${esc(cap)} en Instagram"><div class="media ${k === 'prod' ? '' : 'grain'}">${igMedia(k, o, cap)}</div><span class="ig__cap">${esc(cap)}</span></a>`).join('')}</div>
        </div>
      </section>`,
      ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'VESCORA', url: D.site.domain + '/', potentialAction: { '@type': 'SearchAction', target: D.site.domain + '/buscar?q={q}', 'query-input': 'required name=q' } }
    };
  };

  function tile(o, href, meta, i, badge = '') {
    return `<a class="tile reveal reveal-d${i % 3}" href="${href}">${sceneMedia(o, '', o.name)}<span class="tile__arrow" aria-hidden="true">↗</span><div class="tile__body">${badge ? `<div class="tile__badge">${esc(badge)}</div>` : ''}<div class="tile__name">${esc(o.name)}</div><div class="tile__meta">${esc(meta)}</div></div></a>`;
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

  // Orden del catálogo: por categoría (señuelos primero) y, dentro de cada una, primero lo que tiene fotografía real.
  const CAT_ORDER = Object.fromEntries(D.categories.map((c, i) => [c.id, i]));
  const PROD_ORDER = Object.fromEntries(D.products.map((p, i) => [p.id, i]));
  const catalogSort = (a, b) => CAT_ORDER[a.category] - CAT_ORDER[b.category] || (b.photo ? 1 : 0) - (a.photo ? 1 : 0) || PROD_ORDER[a.id] - PROD_ORDER[b.id];

  // Catálogo general y por categoría. El tipo de agua es un filtro del catálogo (desplegable "Tipo de agua"):
  // llega por ruta (/equipamiento/agua-dulce) o por ?agua=.
  V.catalog = (catId, q, waterSlug) => {
    const cat = catId ? CAT[catId] : null;
    if (catId && !cat) return V.notFound();
    const water = waterSlug ? WATER_BY_Q[waterSlug] : waterParam(q);
    const ws = water ? [water.id] : null;
    const f = { sub: q.get('tipo') || '', tec: q.get('tecnica') || '', esp: q.get('especie') || '' };
    const inCtx = (p) => inWater(p, ws);
    const list = D.products.filter((p) => inCtx(p) && (!cat || p.category === cat.id) && (!f.sub || p.sub === f.sub) && (!f.tec || p.techniques.includes(f.tec)) && (!f.esp || p.species.includes(f.esp))).sort(catalogSort);
    const base = cat ? `equipamiento/${cat.id}` : water ? `equipamiento/${water.slug}` : 'equipamiento';
    const qs = (patch) => { const o = Object.assign({}, { tipo: f.sub, tecnica: f.tec, especie: f.esp, agua: cat && water ? water.q : '' }, patch); const s = new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString(); return base + (s ? '?' + s : ''); };
    // Al cambiar de agua se conservan los filtros que sigan siendo compatibles.
    const waterHref = (w) => {
      const keep = { tecnica: f.tec && inWater(TECH[f.tec], w && [w.id]) ? f.tec : '', especie: f.esp && inWater(SPEC[f.esp], w && [w.id]) ? f.esp : '' };
      if (cat) { const o = Object.assign({ tipo: f.sub, agua: w ? w.q : '' }, keep); const s = new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString(); return base + (s ? '?' + s : ''); }
      const s = new URLSearchParams(Object.fromEntries(Object.entries(keep).filter(([, v]) => v))).toString();
      return (w ? `equipamiento/${w.slug}` : 'equipamiento') + (s ? '?' + s : '');
    };
    const subsShown = cat ? cat.sub.filter((s) => D.products.some((p) => p.category === cat.id && p.sub === s.id && inCtx(p))) : [];
    const chipsTop = cat
      ? [`<a class="chip ${!f.sub ? 'is-active' : ''}" href="${qs({ tipo: '' })}">Todo</a>`].concat(subsShown.map((s) => `<a class="chip ${f.sub === s.id ? 'is-active' : ''}" href="${qs({ tipo: s.id })}">${esc(s.name)}</a>`))
      : null;
    const crumbItems = [['Inicio', './'], ['Equipamiento', 'equipamiento']].concat(water ? [[water.name, cat ? `equipamiento/${water.slug}` : null]] : []).concat(cat ? [[cat.name]] : []);
    if (!cat && !water) crumbItems[1] = ['Equipamiento'];
    // Categorías en tarjetas compactas; la categoría prioritaria (`highlight`, Señuelos) va primero y con acceso a sus tipos.
    const catNav = () => {
      const cats = D.categories.map((c) => ({ c, items: D.products.filter((p) => p.category === c.id && inCtx(p)).sort(catalogSort) }))
        .filter((x) => x.items.length).sort((a, b) => (b.c.highlight ? 1 : 0) - (a.c.highlight ? 1 : 0));
      return `<section class="catnav-section"><div class="wrap"><nav class="catnav" aria-label="Categorías de equipamiento">${cats.map(({ c, items }) => {
        const subs = c.highlight ? c.sub.filter((s) => items.some((p) => p.sub === s.id)) : [];
        return `<div class="catnav__item${c.highlight ? ' catnav__item--lead' : ''}">
          <a class="catnav__link" href="${withWater(`equipamiento/${c.id}`, water)}"><span class="catnav__media">${prodArt(items[0])}</span><span class="catnav__body"><span class="catnav__name">${esc(c.name)}</span><span class="catnav__count">${items.length} ${items.length === 1 ? 'producto' : 'productos'}</span></span></a>
          ${subs.length ? `<div class="catnav__subs">${subs.map((s) => `<a href="${withWater(`equipamiento/${c.id}?tipo=${s.id}`, water)}">${esc(s.name)}</a>`).join('')}</div>` : ''}
        </div>`;
      }).join('')}</nav></div></section>`;
    };
    const intro = cat
      ? pageHero({ eyebrow: water ? `Equipamiento · ${water.name}` : 'Equipamiento', title: cat.name, lede: cat.claim + ' ' + cat.intro, scene: { scene: cat.scene, id: 'cat-' + cat.id, photo: cat.photo }, crumbsHtml: crumbs(crumbItems), solid: true })
      : `<section class="page-head page-head--compact"><div class="wrap">${crumbs(crumbItems)}${water ? '<div class="eyebrow" style="margin-bottom:18px">Equipamiento</div>' : ''}<h1 class="display">${esc(water ? water.name : 'Equipamiento')}</h1><p class="lede">${esc(water ? water.intro : 'Todo nuestro catálogo: señuelos, cañas, carretes, líneas y accesorios. Filtra por tipo de agua, técnica o especie.')}</p></div></section>
        ${catNav()}`;
    return {
      title: cat ? `${cat.name} de pesca${water ? ' · ' + water.name : ''} · Equipamiento` : water ? `Equipamiento de pesca en ${water.name.toLowerCase()}` : 'Equipamiento de pesca',
      description: cat ? `${cat.claim} ${cat.intro}` : water ? `Equipamiento VESCORA para pesca en ${water.name.toLowerCase()}: ${water.claim}` : 'Catálogo VESCORA: señuelos, cañas, carretes, líneas y accesorios de pesca en agua dulce y salada, organizados por técnica y especie.',
      over: !!cat,
      html: `${intro}
      <section class="section catalog" style="padding-top:clamp(28px,4vw,52px)">
        <div class="wrap">
          <div class="toolbar"><div class="toolbar__row">
            ${chipsTop ? `<div class="chips chips--scroll" style="flex:1;min-width:0">${chipsTop.join('')}</div>` : '<span class="toolbar__label">Filtrar el catálogo</span>'}
            <div class="toolbar__selects">
              <label class="sr-only" for="f-agua">Tipo de agua</label>
              <select id="f-agua" data-water><option value="">Todas las aguas</option>${WATERS.map((w) => `<option value="${w.q}" ${water && water.id === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select>
              <label class="sr-only" for="f-tec">Técnica</label>
              <select id="f-tec" data-filter="tecnica"><option value="">Todas las técnicas</option>${D.techniques.filter((t) => inWater(t, ws)).map((t) => `<option value="${t.id}" ${f.tec === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
              <label class="sr-only" for="f-esp">Especie</label>
              <select id="f-esp" data-filter="especie"><option value="">Todas las especies</option>${WATERS.filter((w) => !ws || ws.includes(w.id)).map((w) => `<optgroup label="${esc(w.name)}">${D.species.filter((s) => wOf(s).includes(w.id)).map((s) => `<option value="${s.id}" ${f.esp === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</optgroup>`).join('')}</select>
            </div>
          </div></div>
          <div class="head-row" style="margin-bottom:28px"><span class="count">${list.length} ${list.length === 1 ? 'producto' : 'productos'}</span>${f.tec && TECH[f.tec] ? `<a class="link-arrow" href="${withWater(`tecnicas/${f.tec}`, water)}">Guía de ${esc(TECH[f.tec].name)} ${arrow}</a>` : ''}</div>
          ${list.length ? `<div class="grid grid--4">${list.map(card).join('')}</div>` : `<p class="empty">No hay productos con estos filtros. <a class="link-arrow" href="${base}">Ver todo ${arrow}</a></p>`}
        </div>
      </section>`,
      ld: ldCrumbs(crumbItems),
      after: (root) => {
        $$('[data-filter]', root).forEach((s) => s.addEventListener('change', () => navigate(qs({ [s.dataset.filter]: s.value }), { keepScroll: true })));
        $$('.catnav__media', root).forEach(paintBg);
        const wsel = $('[data-water]', root);
        if (wsel) wsel.addEventListener('change', () => navigate(waterHref(WATER_BY_Q[wsel.value] || null), { keepScroll: true }));
      }
    };
  };

  V.product = (catId, id) => {
    const p = PROD[id];
    if (!p || p.category !== catId) return V.notFound();
    const cat = CAT[p.category];
    const crumbItems = [['Inicio', './'], ['Equipamiento', 'equipamiento'], [cat.name, `equipamiento/${cat.id}`], [p.name]];
    const quick = [[p.category === 'canas' ? 'Longitud' : 'Medida', p.length], [p.category === 'canas' ? 'Lance' : 'Peso', p.specs.Peso || p.specs['Acción de lance'] || '—'], ['Tipo', p.type]];
    const specs = Object.assign({}, p.specs, { 'Tipo de agua': waterNames(p), 'Técnica recomendada': p.techniques.map((t) => TECH[t].name).join(', ') }, p.species.length ? { 'Especies objetivo': p.species.map((s) => SPEC[s].name).join(', ') } : {});
    const related = (p.related || []).map((r) => PROD[r]).filter(Boolean);
    const family = p.family ? D.products.filter((x) => x.family === p.family) : [];
    const sameCat = D.products.filter((x) => x.id !== p.id && x.sub === p.sub && x.category === p.category && (!p.family || x.family !== p.family)).slice(0, 4);
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
          <div class="gallery__main${p.photo ? ' is-photo' : ''}" id="gmain">${prodArt(p)}</div>
          ${p.photos && p.photos.length > 1 ? `<div class="gallery__thumbs gallery__thumbs--photos" style="grid-template-columns:repeat(${Math.min(p.photos.length, 6)},1fr)" role="group" aria-label="Fotos del producto">${p.photos.map((src, i) => `<button type="button" data-photo="${esc(src)}" aria-pressed="${i === 0}" aria-label="Foto ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>` : family.length > 1 ? `<div class="colorways"><div class="block-title">${p.variant ? 'Versiones' : 'Colores'} · ${family.length}</div><div class="gallery__thumbs gallery__thumbs--colors">${family.map((f) => `<a href="${pUrl(f)}" ${f.id === p.id ? 'aria-current="true"' : ''} title="${esc(f.variant || f.color)}">${prodArt(f)}<span>${esc(f.variant || f.color)}</span></a>`).join('')}</div></div>` : p.photo ? '' : `<div class="gallery__thumbs" role="group" aria-label="Vistas del producto">
            <button type="button" data-view="light" aria-pressed="true" aria-label="Vista de estudio">${A.product(p)}</button>
            <button type="button" data-view="dark" class="t-dark" aria-pressed="false" aria-label="Vista en fondo oscuro">${A.product(p)}</button>
            <button type="button" data-view="scene" class="t-scene" aria-pressed="false" aria-label="Vista en su escenario">${A.scene(sceneKey, { seed: p.id, label: 'Escenario' })}</button>
          </div>`}
        </div>
        <div class="product__info">
          <div>
            <div class="eyebrow">${esc(cat.name)} · ${esc(subName(p))}</div>
            <h1 class="product__name" style="margin-top:16px">${esc(p.name)}</h1>
          </div>
          <dl class="quick">${quick.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <div><p class="lede" style="max-width:none">${esc(p.summary)}</p><p class="muted" style="margin-top:14px">${esc(p.description)}</p></div>
          ${family.length > 1 && p.photos ? `<div><h2 class="block-title">Versiones</h2><div class="chips">${family.map((f) => `<a class="chip ${f.id === p.id ? 'is-active' : ''}" href="${pUrl(f)}" ${f.id === p.id ? 'aria-current="page"' : ''}>${esc(f.variant || f.name)}</a>`).join('')}</div></div>` : ''}
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
            <div class="eco__now reveal"><div class="eyebrow on-dark">Estás viendo</div><div class="media${p.photo ? ' is-photo' : ''}">${prodArt(p)}</div><div><div class="h3" style="text-transform:uppercase">${esc(p.name)}</div><div class="small" style="opacity:.7">${esc(specLine(p))}</div></div></div>
            <div class="reveal reveal-d1"><div class="block-title">También puedes necesitar</div><div class="eco__list">${related.map((r) => `<a class="eco__item" href="${pUrl(r)}"><span class="thumb">${prodArt(r)}</span><span><span class="kit__role">${esc(subName(r))}</span><strong>${esc(r.name)}</strong><span class="small muted">${esc(specLine(r))}</span></span><span class="eco__plus" aria-hidden="true">+</span></a>`).join('')}</div></div>
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
        paintBg($('.eco__now .media.is-photo', root));
        paintBg($('#gmain.is-photo', root));
        const main = $('#gmain', root);
        // Varias fotos: las miniaturas cambian la foto principal.
        $$('[data-photo]', root).forEach((b) => b.addEventListener('click', () => {
          $$('[data-photo]', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
          $('img', main).src = b.dataset.photo;
          paintBg(main);
        }));
        $$('.gallery__thumbs button[data-view]', root).forEach((b) => b.addEventListener('click', () => {
          $$('.gallery__thumbs button[data-view]', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
          const v = b.dataset.view;
          main.className = 'gallery__main' + (v === 'dark' ? ' is-dark' : v === 'scene' ? ' is-scene grain' : '');
          main.innerHTML = v === 'scene' ? A.scene(sceneKey, { seed: p.id, label: 'Escenario habitual' }) + `<div class="gallery__float">${A.product(p)}</div>` : prodArt(p);
        }));
      }
    };
  };

  // Técnicas y especies: una sola sección con dos áreas. Dentro de cada área, las tarjetas se agrupan por tipo de agua;
  // una técnica multiagua (Spinning) aparece en ambos grupos, pero es la misma entidad.
  function waterGrouped(items, only, hrefFor, metaFor, area) {
    return WATERS.filter((w) => !only || only.id === w.id).map((w) => {
      const list = items.filter((x) => wOf(x).includes(w.id));
      if (!list.length) return '';
      return `<div class="water-group">
        <div class="water-group__head reveal"><h3 class="water-group__title">${esc(w.name)}</h3><span class="water-group__claim">${esc(w.claim)}</span>${only ? '' : `<a class="link-arrow" href="${TS}?agua=${w.q}#${area}">Solo ${esc(w.name.toLowerCase())} ${arrow}</a>`}</div>
        <div class="tiles">${list.map((x, i) => tile(x, hrefFor(x, w), metaFor(x), i, wOf(x).length > 1 ? waterNames(x) : '')).join('')}</div>
      </div>`;
    }).join('');
  }

  V.techSpecies = (q) => {
    const water = waterParam(q);
    const ws = water ? [water.id] : null;
    const nT = D.techniques.filter((t) => inWater(t, ws)).length;
    const nS = D.species.filter((s) => inWater(s, ws)).length;
    const self = (hash) => `${TS}${water ? '?agua=' + water.q : ''}#${hash}`;
    const ci = [['Inicio', './'], ['Técnicas y especies', water ? TS : null]].concat(water ? [[water.name]] : []);
    return {
      title: water ? `Técnicas y especies de ${water.name.toLowerCase()}` : 'Técnicas y especies de pesca',
      description: 'Cómo y qué pescar: spinning, light spinning, fly fishing, eging, surfcasting… y lubina, trucha, black bass, calamar y más especies, con su equipamiento recomendado.',
      html: `<section class="page-head"><div class="wrap">${crumbs(ci)}<h1 class="display">Técnicas y especies</h1>
        <p class="lede">Cómo quieres pescar y qué quieres encontrar. Cada técnica y cada especie te lleva a su equipamiento recomendado.</p>
        <div class="ts-nav">
          <nav class="chips" aria-label="Áreas de la sección"><a class="chip" href="${self('tecnicas')}">Técnicas · ${nT}</a><a class="chip" href="${self('especies')}">Especies · ${nS}</a></nav>
          ${waterSwitch(water, (w) => (w ? `${TS}?agua=${w.q}` : TS))}
        </div></div></section>
      <section class="section ts-area" id="tecnicas" style="padding-top:clamp(16px,3vw,40px)">
        <div class="wrap">
          <div class="ts-area__head reveal"><span class="ts-area__n">01</span><div><h2 class="h2">Técnicas</h2><p class="muted">Cómo y dónde vas a pescar.</p></div></div>
          ${waterGrouped(D.techniques, water, (t, w) => `tecnicas/${t.id}?agua=${w.q}`, (t) => t.claim, 'tecnicas')}
        </div>
      </section>
      <section class="section section--paper2 ts-area" id="especies">
        <div class="wrap">
          <div class="ts-area__head reveal"><span class="ts-area__n">02</span><div><h2 class="h2">Especies</h2><p class="muted">Qué quieres pescar.</p></div></div>
          ${waterGrouped(D.species, water, (s) => `especies/${s.id}`, (s) => s.claim, 'especies')}
        </div>
      </section>
      <section class="section section--tight"><div class="wrap">${ctaBand('¿Ya sabes qué y cómo?', 'Lleva tu especie, tu escenario y tu técnica al recomendador y te proponemos el equipo.')}</div></section>`,
      ld: ldCrumbs(ci)
    };
  };

  function gearGroups(list, labelFor) {
    const groups = [['canas', 'Cañas y carretes', ['canas', 'carretes']], ['senuelos', 'Señuelos', ['senuelos']], ['lineas', 'Líneas', ['lineas']], ['accesorios', 'Accesorios', ['accesorios']]];
    return groups.map(([k, name, cats]) => {
      const items = list.filter((p) => cats.includes(p.category));
      if (!items.length) return '';
      return `<div class="gear-group"><div class="gear-group__head reveal"><h3>${name}</h3><a class="link-arrow" href="equipamiento/${k}${labelFor ? '?' + labelFor : ''}">Ver ${arrow}</a></div><div class="rail">${items.map(card).join('')}</div></div>`;
    }).join('');
  }

  V.technique = (id, q) => {
    const t = TECH[id];
    if (!t) return V.notFound();
    const multi = wOf(t).length > 1;
    // El agua de contexto solo aplica si la técnica la admite (p. ej. Spinning en agua dulce).
    const pw = waterParam(q);
    const water = pw && inWater(t, [pw.id]) ? pw : singleWater(t);
    const ws = water ? [water.id] : null;
    const list = productsFor('techniques', id).filter((p) => inWater(p, ws));
    const sp = D.species.filter((s) => s.techniques.includes(id) && inWater(s, ws));
    const ci = [['Inicio', './'], ['Técnicas y especies', TS]].concat(water ? [[water.name, `${TS}?agua=${water.q}#tecnicas`]] : []).concat([[t.name]]);
    const filterQ = 'tecnica=' + t.id + (water ? '&agua=' + water.q : '');
    return {
      title: `${t.name}${multi && water ? ' en ' + water.name.toLowerCase() : ''} · Equipamiento recomendado`,
      description: `${t.claim} ${t.intro}`.slice(0, 158),
      over: true,
      html: `${pageHero({ eyebrow: `Técnica · ${waterNames(t)}`, title: t.name, lede: t.claim, scene: { scene: t.scene, id: 'tech-' + t.id, photo: t.photo }, crumbsHtml: crumbs(ci) })}
      <section class="section section--dark on-dark" style="padding-top:clamp(48px,6vw,88px)">
        <div class="wrap">
          <div class="intro-grid"><div class="eyebrow">Qué es</div><p class="big reveal">${esc(t.intro)}</p></div>
          <dl class="facts">
            <div><dt>Tipo de pesca</dt><dd>${esc(t.type)}</dd></div><div><dt>Escenario habitual</dt><dd>${esc(t.scenario)}</dd></div>
            ${t.gear.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            <div><dt>Tipo de agua</dt><dd>${esc(waterNames(t))}</dd></div>
            <div><dt>Especies habituales</dt><dd>${sp.map((s) => esc(s.name)).join(', ') || '—'}</dd></div>
          </dl>
        </div>
      </section>
      <section class="section" id="equipo">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Guía práctica</div><h2 class="h2" style="margin-top:18px">Equipamiento recomendado</h2></div><a class="btn" href="${withWater(`equipamiento?tecnica=${t.id}`, water)}">Explorar equipamiento de ${esc(t.name)} ${arrow}</a></div>
          ${multi ? `<div style="margin:-12px 0 36px">${waterSwitch(water, (w) => `tecnicas/${t.id}${w ? '?agua=' + w.q : ''}#equipo`)}</div>` : ''}
          ${list.length ? gearGroups(list, filterQ) : `<p class="empty">Todavía no hay equipamiento VESCORA para ${esc(t.name)}${water ? ' en ' + esc(water.name.toLowerCase()) : ''}.</p>`}
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap intro-grid">
          <div><div class="eyebrow">Consejos</div><h2 class="h2" style="margin-top:18px">Antes del primer lance</h2></div>
          <ol class="tips">${t.tips.map((x) => `<li class="reveal">${esc(x)}</li>`).join('')}</ol>
        </div>
      </section>
      ${sp.length ? `<section class="section">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Especies</div><h2 class="h2" style="margin-top:18px">Qué pescar con ${esc(t.name)}</h2></div></div>
          <div class="tiles tiles--4">${sp.map((s, i) => tile(s, `especies/${s.id}`, s.claim, i)).join('')}</div>
          <div style="margin-top:48px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="${withWater(`equipamiento?tecnica=${t.id}`, water)}">Explorar equipamiento de ${esc(t.name)} ${arrow}</a><a class="btn btn--ghost" href="${FINDER}"><span>Encuentra tu equipo</span></a></div>
        </div>
      </section>` : ''}`,
      ld: [ldCrumbs(ci), { '@context': 'https://schema.org', '@type': 'Article', headline: `${t.name}: equipamiento recomendado`, about: t.name, publisher: { '@type': 'Organization', name: 'VESCORA' } }]
    };
  };

  V.species = (id) => {
    const s = SPEC[id];
    if (!s) return V.notFound();
    const water = singleWater(s);
    const list = productsFor('species', id);
    const ci = [['Inicio', './'], ['Técnicas y especies', TS]].concat(water ? [[water.name, `${TS}?agua=${water.q}#especies`]] : []).concat([[s.name]]);
    return {
      title: `${s.name} · Técnicas y equipamiento recomendado`,
      description: `${s.claim} ${s.intro}`.slice(0, 158),
      over: true,
      html: `${pageHero({ eyebrow: `${s.latin} · ${waterNames(s)}`, title: s.name, lede: s.claim, scene: { scene: s.scene, id: 'sp-' + s.id, photo: s.photo }, crumbsHtml: crumbs(ci) })}
      <section class="section">
        <div class="wrap intro-grid">
          <div class="eyebrow">Comportamiento</div>
          <div><p class="big reveal">${esc(s.intro)}</p>
            <div class="block-title" style="margin-top:40px">Técnicas recomendadas</div>
            <div class="chips">${s.techniques.filter((t) => TECH[t]).map((t) => `<a class="chip" href="${withWater(`tecnicas/${t}`, water)}">${esc(TECH[t].name)} ↗</a>`).join('')}</div>
            <div class="block-title" style="margin-top:28px">Escenarios</div>
            <div class="chips">${scenariosFor(id).map((c) => `<span class="chip" style="cursor:default">${esc(c.name)}</span>`).join('')}</div>
          </div>
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Equipamiento</div><h2 class="h2" style="margin-top:18px">Para pescar ${esc(s.name.toLowerCase())}</h2></div><a class="btn" href="${withWater(`equipamiento?especie=${s.id}`, water)}">Ver todo ${arrow}</a></div>
          ${list.length ? gearGroups(list, 'especie=' + s.id + (water ? '&agua=' + water.q : '')) : `<p class="empty">Todavía no hay equipamiento VESCORA específico para ${esc(s.name.toLowerCase())}.</p>`}
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
    if (init.species) cleanFinder(init);
    return {
      title: 'Encuentra tu equipo · Qué señuelo elegir',
      description: 'Elige qué quieres pescar, dónde y con qué técnica: VESCORA te propone un equipo de partida con productos reales de su catálogo.',
      html: `<section class="section section--forest on-dark finder-page">
        <div class="wrap">
          ${crumbs([['Inicio', './'], ['Encuentra tu equipo']])}
          <div class="head-row"><div><div class="eyebrow">Tu equipo en cuatro decisiones</div><h1 class="h1" style="margin-top:18px">Encuentra tu equipo</h1></div>
          <p class="lede">¿No sabes qué señuelo elegir? Dinos qué quieres pescar, dónde y con qué técnica. VESCORA cruza tus respuestas con su catálogo y te propone un equipo de partida que puedes ajustar y compartir.</p></div>
          ${finderHtml(init, true)}
          <p class="finder-page__alt">¿Prefieres ver todos los productos? <a class="link-arrow" href="equipamiento">Explorar equipamiento ${arrow}</a></p>
        </div>
      </section>`,
      ld: ldCrumbs([['Inicio', './'], ['Encuentra tu equipo']]),
      after: (root) => bindFinder(root, init)
    };
  };

  V.about = () => {
    const chapters = [
      ['02', 'Origen', 'Nacemos en la pesca', [
        'VESCORA nace de una idea sencilla: disfrutar de la pesca empieza mucho antes de lanzar el señuelo. Empieza al conocer el escenario, elegir correctamente el equipo y confiar en cada lance.',
        'Por eso no nos limitamos a enseñar productos: te ayudamos a elegir por técnica, por especie y con una herramienta que convierte tus respuestas en un equipo de partida.'
      ], 'assets/photos/journal-spinning-desde-costa-equipamiento-basico.webp', 'Dos pescadores en las rocas frente al mar'],
      ['03', 'Equipamiento', 'Equipo que funciona', [
        'No queremos tenerlo todo. Queremos tener lo que funciona. Cada producto entra en el catálogo porque resuelve una situación concreta de pesca y porque encaja con el resto del equipo.',
        'Buscamos equipo que aguante la sal, el sol y los golpes contra la roca, y que siga funcionando jornada tras jornada.'
      ], 'assets/photos/journal-como-elegir-un-vinilo-para-lubina.jpg', 'Equipo de pesca ordenado sobre una mesa de madera'],
      ['04', 'Naturaleza', 'Salir a descubrir', [
        'Salir de noche a un puerto, caminar una costa que no conoces, llegar a un río antes que la luz. La pesca es nuestra forma de descubrir lugares.',
        'Pescamos en lugares que queremos seguir encontrando igual. Respeta tallas y vedas, llévate tu basura y deja el sitio mejor de como lo encontraste.'
      ], 'assets/photos/journal-que-gramaje-utilizar-segun-las-condiciones.webp', 'Dos pescadores sentados junto a un río al atardecer']
    ];
    const lines = D.site.lines;
    return {
      title: 'Vescora · Quiénes somos',
      description: 'VESCORA nace en la pesca y crece hacia el outdoor: equipamiento honesto y funcional para quienes encuentran su lugar fuera del camino.',
      over: true,
      html: `${pageHero({ eyebrow: 'Vescora', title: 'Equipment for the wild', lede: 'Nacemos en la pesca. Nos mueve todo lo que ocurre fuera del camino.', scene: { scene: 'coast', id: 'about', photo: 'assets/photos/agua-salada.webp' }, crumbsHtml: crumbs([['Inicio', './'], ['Vescora']]) })}
      <section class="section">
        <div class="wrap manifesto">
          <div class="reveal">
            ${sceneMedia({ scene: 'river', id: 'manifesto', photo: 'assets/photos/manifiesto-carrete.webp' }, 'manifesto__media', 'Mano sujetando la caña y recogiendo línea con el carrete de spinning')}
            <div class="manifesto__caption"><span>Spinning · Recogida</span><span>01 / Manifiesto</span></div>
          </div>
          <div class="manifesto__text reveal reveal-d1">
            <div class="eyebrow">Manifiesto</div>
            <h2 class="h2" style="margin:20px 0 36px">Más que equipamiento</h2>
            <p>Creemos que la pesca empieza mucho antes del primer lance.</p>
            <p>Empieza al elegir el equipo, estudiar el escenario y entender qué tienes delante.</p>
            <p>VESCORA nace para acompañar cada una de esas decisiones.</p>
          </div>
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap chapters">
          ${chapters.map(([n, k, t, ps, photo, alt], i) => `<article class="chapter${i % 2 ? ' chapter--flip' : ''} reveal">
            ${sceneMedia({ photo, id: 'ch' + i }, 'chapter__media', alt)}
            <div class="chapter__text"><div class="chapter__n">${n} · ${esc(k)}</div><h2 class="h2">${esc(t)}</h2>${ps.map((x) => `<p>${esc(x)}</p>`).join('')}</div>
          </article>`).join('')}
        </div>
      </section>
      <section class="brand-band">
        <div class="brand-band__media">${sceneMedia({ photo: 'assets/photos/journal-como-elegir-un-fluorocarbono.webp', id: 'band' }, '', 'Pescador en una barca entre la niebla de un lago')}</div>
        <div class="wrap brand-band__content"><p class="brand-band__quote">La pesca es nuestro origen. La exploración, nuestro territorio.</p></div>
      </section>
      <section class="section">
        <div class="wrap intro-grid">
          <div><div class="chapter__n">05 · Visión</div><h2 class="h2" style="margin-top:14px">Hacia dónde vamos</h2></div>
          <div class="vision reveal">
            <p class="big">Hoy, VESCORA es pesca: señuelos, líneas y el equipo que te acompaña junto al agua. Pero lo que nos mueve va más allá del agua.</p>
            <p>Queremos crecer hacia ropa, accesorios y equipo para trekking, camping y otras actividades al aire libre, sin perder lo que nos define: equipo honesto, funcional y pensado para usarse.</p>
            <dl class="vision__lines"><div><dt>Hoy</dt><dd>${lines.filter((l) => l.active).map((l) => esc(l.name)).join(' · ')}</dd></div><div><dt>Hacia dónde vamos</dt><dd>${lines.filter((l) => !l.active).map((l) => esc(l.name)).join(' · ')}</dd></div></dl>
          </div>
        </div>
      </section>
      <section class="section section--paper2">
        <div class="wrap">
          <div class="head-row reveal"><div><div class="eyebrow">Filosofía</div><h2 class="h2" style="margin-top:18px">Lo que nos mueve</h2></div><a class="link-arrow" href="vescora/filosofia">Leer filosofía ${arrow}</a></div>
          ${pillars()}
        </div>
      </section>
      <section class="section section--dark on-dark">
        <div class="wrap" style="text-align:center">
          <p class="h2" style="max-width:20ch;margin:0 auto 32px">Hoy, la pesca. Mañana, cualquier lugar fuera del camino.</p>
          <div class="cta-row"><a class="btn btn--light" href="equipamiento">Explorar equipamiento ${arrow}</a><a class="btn btn--ghost" href="${FINDER}"><span>Encuentra tu equipo</span></a></div>
        </div>
      </section>`,
      ld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Quiénes somos · VESCORA' }
    };
  };

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
    D.products.forEach((p) => INDEX.push({ type: 'Productos', title: p.name, sub: `${p.type} · ${specLine(p)}`, url: pUrl(p), p, text: norm([p.name, p.type, p.summary, CAT[p.category].name, subName(p), p.length, p.weight != null ? p.weight + ' g' : '', Object.values(p.specs).join(' '), p.techniques.map((t) => TECH[t].name).join(' '), p.species.map((s) => SPEC[s].name).join(' '), p.conditions.map((c) => COND[c].name).join(' '), waterNames(p)].join(' ')), key: norm(p.name + ' ' + p.type + ' ' + subName(p)) }));
    D.techniques.forEach((t) => INDEX.push({ type: 'Técnicas', title: t.name, sub: t.claim, url: 'tecnicas/' + t.id, o: t, text: norm([t.name, t.claim, t.intro, t.scenario, waterNames(t)].join(' ')), key: norm(t.name) }));
    D.species.forEach((s) => INDEX.push({ type: 'Especies', title: s.name, sub: s.claim, url: 'especies/' + s.id, o: s, text: norm([s.name, s.latin, s.claim, s.intro, waterNames(s)].join(' ')), key: norm(s.name) }));
    WATERS.forEach((w) => {
      INDEX.push({ type: 'Categorías', title: `Equipamiento · ${w.name}`, sub: w.claim, url: `equipamiento/${w.slug}`, text: norm(`equipamiento ${w.name} ${w.claim}`), key: norm(`${w.name} equipamiento`) });
      INDEX.push({ type: 'Categorías', title: `Técnicas y especies · ${w.name}`, sub: w.claim, url: `${TS}?agua=${w.q}`, text: norm(`tecnicas especies ${w.name} ${w.claim}`), key: norm(`${w.name} tecnicas especies`) });
    });
    INDEX.push({ type: 'Categorías', title: 'Encuentra tu equipo', sub: 'Te ayudamos a elegir según especie, escenario y técnica', url: FINDER, text: norm('encuentra tu equipo recomendador que señuelo elegir ayuda especie escenario tecnica'), key: norm('encuentra tu equipo') });
    INDEX.push({ type: 'Categorías', title: 'Técnicas y especies', sub: 'Cómo y qué pescar', url: TS, text: norm('tecnicas especies guia como pescar'), key: norm('tecnicas especies') });
    D.categories.forEach((c) => {
      INDEX.push({ type: 'Categorías', title: c.name, sub: c.claim, url: 'equipamiento/' + c.id, text: norm(c.name + ' ' + c.intro), key: norm(c.name) });
      c.sub.forEach((s) => INDEX.push({ type: 'Categorías', title: `${c.name} · ${s.name}`, sub: c.name, url: `equipamiento/${c.id}?tipo=${s.id}`, text: norm(s.name + ' ' + c.name), key: norm(s.name) }));
    });
    if (D.site.features.journal) D.journal.forEach((a) => INDEX.push({ type: 'Journal', title: a.title, sub: `${a.cat} · ${a.read} min`, url: 'journal/' + a.slug, o: a, text: norm([a.title, a.excerpt, a.cat, a.body.map((b) => [].concat(b[1]).join(' ')).join(' ')].join(' ')), key: norm(a.title) }));
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
    const groups = ['Productos', 'Técnicas', 'Especies', 'Categorías'].concat(D.site.features.journal ? ['Journal'] : []);
    const thumb = (it) => it.p ? prodArt(it.p) : it.o && it.o.scene ? A.scene(it.o.scene, { seed: it.o.id || it.o.slug, label: it.title }) : '';
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
      description: 'Busca productos, técnicas, especies y categorías de VESCORA.',
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
    const wq = (slug) => WATER_BY_Q[slug].q;
    if (!a) return V.home();
    if (a === 'equipamiento') return c ? V.product(b, c) : isWaterSlug(b) ? V.catalog(null, q, b) : V.catalog(b, q);
    if (a === TS && !b) return V.techSpecies(q);
    // Los listados de Técnicas y de Especies viven ahora en Técnicas y especies; las fichas mantienen su URL.
    if (a === 'tecnicas') return c ? V.notFound() : !b ? { redirect: `${TS}#tecnicas` } : isWaterSlug(b) ? { redirect: `${TS}?agua=${wq(b)}#tecnicas` } : V.technique(b, q);
    if (a === 'especies') return c ? V.notFound() : !b ? { redirect: `${TS}#especies` } : isWaterSlug(b) ? { redirect: `${TS}?agua=${wq(b)}#especies` } : V.species(b);
    if (a === FINDER && !b) return V.finder(q);
    if (a === 'tu-equipo' && !b) return { redirect: FINDER + location.search };
    if (a === 'vescora') return b === 'filosofia' ? V.philosophy() : b ? V.notFound() : V.about();
    if (a === 'journal') {
      if (D.site.features.journal) return b ? V.article(b) : V.journal(q);
      // Journal no es público: cada artículo redirige a la guía de su técnica o especie.
      const art = b && ART[b];
      return { redirect: art && art.techniques[0] ? `tecnicas/${art.techniques[0]}` : art && art.species[0] ? `especies/${art.species[0]}` : TS };
    }
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
    // Rutas antiguas: se sustituyen por su nueva URL sin añadir una entrada al historial.
    if (v.redirect) { history.replaceState(null, '', BASE + v.redirect); return render(opts); }
    const main = $('#main');
    main.innerHTML = `<div class="view">${v.html}</div>`;
    setMeta(v, path);
    overHero = !!v.over;
    onScroll();
    // Navegación activa
    const top = path.split('/')[0];
    const section = { tecnicas: TS, especies: TS }[top] || top;
    $$('.nav a').forEach((a) => (a.getAttribute('href') === section ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
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
  const catsMenu = D.categories.slice().sort((x, y) => (y.highlight ? 1 : 0) - (x.highlight ? 1 : 0));
  menu.innerHTML = `<div class="wrap"><div class="menu__top"><a class="brand" href="./"><span class="brand__emblem" aria-hidden="true"></span><span class="brand__word">VESCORA</span></a>${closeBtn('menú')}</div>
    <div class="menu__grid">
      <nav class="menu__main" aria-label="Menú principal">${NAV.map(([t, u], i) => `<a href="${u}"><small>0${i + 1}</small>${t}</a>`).join('')}</nav>
      <div class="menu__cols">
        <div><h4>Equipamiento</h4>${catsMenu.map((c) => `<a href="equipamiento/${c.id}">${esc(c.name)}</a>`).join('')}<a href="equipamiento">Todo el equipamiento</a></div>
        <div><h4>Técnicas</h4>${D.techniques.map((t) => `<a href="tecnicas/${t.id}">${esc(t.name)}</a>`).join('')}</div>
        <div><h4>Especies</h4>${WATERS.map((w) => `<a class="menu__water" href="${TS}?agua=${w.q}#especies">${esc(w.name)}</a>${D.species.filter((s) => wOf(s).includes(w.id)).map((s) => `<a href="especies/${s.id}">${esc(s.name)}</a>`).join('')}`).join('')}</div>
        <div><h4>Vescora</h4><a href="vescora">Quiénes somos</a><a href="vescora/filosofia">Filosofía</a><a href="contacto">Contacto</a></div>
        <div><h4>Síguenos</h4><a href="${esc(D.site.instagram)}" target="_blank" rel="noopener">Instagram ${ext}</a><a href="mailto:${esc(D.site.email)}">${esc(D.site.email)}</a></div>
      </div>
    </div></div>`;
  const suggestions = ['lubina', 'spinning', 'vinilo 15g', 'jurel', 'rockfishing', 'fluorocarbono', 'calamar'];
  srch.innerHTML = `<div class="wrap"><div class="search__top"><span class="eyebrow">Buscar en Vescora</span>${closeBtn('buscador')}</div>
    <div class="search__body">
      <form class="search__field" role="search" action="buscar" id="search-form"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><label class="sr-only" for="q">Buscar productos, técnicas o especies</label><input id="q" name="q" placeholder="¿Qué buscas?" autocomplete="off"></form>
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
