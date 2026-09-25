# VESCORA — Equipment for the wild

Web oficial de VESCORA, versión 1: **catálogo digital + experiencia de marca + guía para el pescador**.
No hay carrito, pagos ni cuentas de usuario: las compras se hacen en plataformas externas (Wallapop, Vinted, Mira Anuncio…).

> Principio de diseño: *no diseñes una tienda de pesca premium; diseña una marca outdoor premium cuyo territorio inicial es la pesca.*

## Arrancar en local

```bash
node serve.mjs
```

Abre http://localhost:4173. No hay dependencias ni paso de build.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Documento único: header, footer, metadatos base |
| `assets/js/data.js` | **Todo el contenido**: configuración, categorías, productos, técnicas, especies, condiciones y Journal |
| `assets/js/app.js` | Router con URLs amigables, vistas, buscador, "Tu equipo", SEO por ruta |
| `assets/js/art.js` | Ilustraciones SVG provisionales (paisajes y producto) |
| `assets/css/styles.css` | Sistema visual (tokens de color, tipografía, componentes) |
| `assets/brand/` | Logotipos originales · `assets/img/` emblema recoloreable (máscara) |
| `404.html`, `_redirects` | Soporte de URLs amigables en GitHub Pages / Netlify |
| `tools/build-sitemap.mjs` | Regenera `sitemap.xml` desde los datos |

## Rutas

`/equipamiento` · `/equipamiento/senuelos` · `/equipamiento/senuelos/paddle-tail-90` ·
`/tecnicas/spinning` · `/especies/lubina` · `/tu-equipo` · `/vescora` · `/vescora/filosofia` ·
`/journal/<slug>` · `/contacto` · `/legal/<pagina>` · `/buscar?q=`

## Cómo editar el contenido

Todo está en `assets/js/data.js`.

- **Productos de ejemplo.** Los productos, medidas y especificaciones actuales son de muestra: sustitúyelos por el catálogo real.
- **Relaciones.** Cada producto declara `techniques`, `species` y `conditions`. Con eso aparece automáticamente en su técnica, su especie, el buscador y "Tu equipo". `related` construye el bloque *También puedes necesitar* y `pairs` indica las cabezas plomadas compatibles con un vinilo.
- **Dónde comprar.** `listings: { wallapop: 'URL del anuncio', vinted: '' }`. Solo aparece un botón por cada plataforma incluida. Si el enlace está vacío se usa el perfil definido en `site.platforms`. Si una plataforma no aparece en `listings`, no se muestra su botón.
- **Fotografía real.** Añade `photo: 'assets/photos/paddle-tail-90.avif'` a un producto, técnica, especie, categoría o artículo y sustituirá a la ilustración (con `loading="lazy"`). Formatos recomendados: AVIF o WebP.
- **Contacto y redes.** `site.email`, `site.instagram`, `site.whatsapp` (vacío = oculto).
- **Datos legales.** `site.legal`: razón social, CIF/NIF, dirección, email, teléfono, responsable y dominio. Hasta completarlos aparecen resaltados entre corchetes (p. ej. `[RAZÓN SOCIAL]`) en las páginas legales. Los textos legales son una base orientativa y conviene que los revise una asesoría.
- **Sitemap.** Después de cambiar datos, ejecuta `node tools/build-sitemap.mjs`.

## Preparado para crecer

- **Ecommerce (fase 2).** Los productos ya tienen `price`, `sku` y `stock` (a `null`) y existe `site.features.commerce`. La interfaz no los muestra mientras sea `false`.
- **Nuevas líneas.** `site.lines` contiene Fishing (activa) y Outdoor, Trekking, Camping y Lifestyle (inactivas). Las líneas inactivas no se muestran, así que no hay categorías vacías.

## Pendiente antes de publicar

1. Sustituir los productos de ejemplo y las ilustraciones por el catálogo y la fotografía reales.
2. Completar `site.legal` y los enlaces de plataformas y redes.
3. Conectar el formulario de contacto a un backend o servicio (Formspree, Netlify Forms…). Ahora mismo abre el cliente de correo con el mensaje preparado.
4. SEO: la web cambia título, descripción, canonical y JSON-LD en cada ruta desde el navegador. Para el mejor posicionamiento conviene prerenderizar las rutas (con un generador estático o SSR) cuando el catálogo sea definitivo.
