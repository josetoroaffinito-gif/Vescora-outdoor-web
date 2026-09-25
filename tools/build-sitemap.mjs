// Genera sitemap.xml a partir de assets/js/data.js: node tools/build-sitemap.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL('../assets/js/data.js', import.meta.url), 'utf8'), ctx);
const D = ctx.window.VESCORA;
const base = D.site.domain.replace(/\/$/, '');
const paths = ['', 'equipamiento', 'tecnicas', 'especies', 'tu-equipo', 'vescora', 'vescora/filosofia', 'journal', 'contacto',
  ...D.categories.map((c) => `equipamiento/${c.id}`),
  ...D.products.map((p) => `equipamiento/${p.category}/${p.id}`),
  ...D.techniques.map((t) => `tecnicas/${t.id}`),
  ...D.species.map((s) => `especies/${s.id}`),
  ...D.journal.map((a) => `journal/${a.slug}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${base}/${p}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${paths.length} URLs`);
