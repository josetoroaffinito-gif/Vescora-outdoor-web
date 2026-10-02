// Valida la coherencia de assets/js/data.js: node tools/validate-data.mjs
// Comprueba ids únicos, referencias válidas y compatibilidad de tipo de agua entre entidades.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL('../assets/js/data.js', import.meta.url), 'utf8'), ctx);
const D = ctx.window.VESCORA;
const WATERS = D.site.waterTypes.map((w) => w.id);
const errors = [], warnings = [];
const index = (arr, name) => {
  const m = new Map();
  arr.forEach((x) => { if (m.has(x.id)) errors.push(`${name}: id duplicado "${x.id}"`); m.set(x.id, x); });
  return m;
};
const P = index(D.products, 'producto'), T = index(D.techniques, 'técnica'), S = index(D.species, 'especie'), C = index(D.conditions, 'condición');
const CAT = new Map(D.categories.map((c) => [c.id, c]));
const wt = (o, label) => {
  if (!Array.isArray(o.waterTypes) || !o.waterTypes.length) { errors.push(`${label}: falta waterTypes`); return WATERS; }
  o.waterTypes.forEach((w) => WATERS.includes(w) || errors.push(`${label}: waterType desconocido "${w}"`));
  return o.waterTypes;
};
const overlap = (a, b) => a.some((x) => b.includes(x));

D.conditions.forEach((c) => wt(c, `condición ${c.id}`));
D.techniques.forEach((t) => wt(t, `técnica ${t.id}`));
D.species.forEach((s) => {
  const w = wt(s, `especie ${s.id}`);
  s.techniques.forEach((t) => {
    if (!T.has(t)) errors.push(`especie ${s.id}: técnica inexistente "${t}"`);
    else if (!overlap(w, T.get(t).waterTypes)) errors.push(`especie ${s.id}: técnica "${t}" sin agua en común`);
  });
  (s.scenarios || []).forEach((c) => {
    if (!C.has(c) || !C.get(c).scenario) errors.push(`especie ${s.id}: escenario inexistente "${c}"`);
    else if (!overlap(w, C.get(c).waterTypes)) errors.push(`especie ${s.id}: escenario "${c}" sin agua en común`);
  });
});
D.products.forEach((p) => {
  const w = wt(p, `producto ${p.id}`);
  const cat = CAT.get(p.category);
  if (!cat) errors.push(`producto ${p.id}: categoría inexistente "${p.category}"`);
  else if (!cat.sub.some((s) => s.id === p.sub)) errors.push(`producto ${p.id}: subcategoría inexistente "${p.sub}"`);
  p.techniques.forEach((t) => (!T.has(t) ? errors.push(`producto ${p.id}: técnica inexistente "${t}"`) : !overlap(w, T.get(t).waterTypes) && errors.push(`producto ${p.id}: técnica "${t}" sin agua en común`)));
  p.species.forEach((s) => (!S.has(s) ? errors.push(`producto ${p.id}: especie inexistente "${s}"`) : !overlap(w, S.get(s).waterTypes) && errors.push(`producto ${p.id}: especie "${s}" sin agua en común`)));
  p.conditions.forEach((c) => (!C.has(c) ? errors.push(`producto ${p.id}: condición inexistente "${c}"`) : !overlap(w, C.get(c).waterTypes) && errors.push(`producto ${p.id}: condición "${c}" sin agua en común`)));
  [...(p.related || []), ...(p.pairs || [])].forEach((r) => P.has(r) || errors.push(`producto ${p.id}: relacionado inexistente "${r}"`));
  if (p.waterReview) warnings.push(`revisar tipo de agua: ${p.id}`);
});
D.journal.forEach((a) => (a.products || []).forEach((r) => P.has(r) || errors.push(`journal ${a.slug}: producto inexistente "${r}"`)));

console.log(`Productos ${D.products.length} · Técnicas ${D.techniques.length} · Especies ${D.species.length} · Escenarios ${D.conditions.filter((c) => c.scenario).length}`);
warnings.length && console.log(`\n${warnings.length} avisos:\n  ` + warnings.join('\n  '));
if (errors.length) { console.error(`\n${errors.length} errores:\n  ` + errors.join('\n  ')); process.exit(1); }
console.log('\nSin errores.');
