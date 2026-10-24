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
| `assets/js/data.js` | **Todo el contenido**: configuración, portada, categorías, productos, técnicas, especies, condiciones y Journal (oculto) |
| `assets/js/app.js` | Router con URLs amigables, vistas, buscador, recomendador "Encuentra tu equipo", SEO por ruta |
| `assets/js/art.js` | Ilustraciones SVG provisionales (paisajes y producto) |
| `assets/css/styles.css` | Sistema visual (tokens de color, tipografía, componentes) |
| `assets/brand/` | Logotipos originales · `assets/img/` emblema recoloreable (máscara) |
| `404.html`, `_redirects` | Soporte de URLs amigables en GitHub Pages / Netlify |
| `tools/build-sitemap.mjs` | Regenera `sitemap.xml` desde los datos |
| `tools/validate-data.mjs` | Comprueba la coherencia de los datos |

## Navegación y rutas

El menú principal tiene cinco apartados (header en `index.html` y menú desplegable en `app.js`, constante `NAV`):

| Apartado | Ruta | Contenido |
|---|---|---|
| Equipamiento | `/equipamiento` | Todo el catálogo. Categorías (Señuelos destacado), filtros por tipo de agua, técnica y especie. Categorías: `/equipamiento/senuelos`… Fichas: `/equipamiento/senuelos/<id>` |
| Técnicas y especies | `/tecnicas-y-especies` | Dos áreas (Técnicas y Especies) agrupadas por tipo de agua. Filtro `?agua=dulce\|salada`. Fichas: `/tecnicas/<id>` y `/especies/<id>` |
| Encuentra tu equipo | `/encuentra-tu-equipo` | El recomendador (Especie → Escenario → Técnica → Peso de lance). Se puede compartir con los parámetros de la URL |
| Vescora | `/vescora` | Historia, manifiesto "Más que equipamiento", visión y filosofía (`/vescora/filosofia`) |
| Contacto | `/contacto` | Formulario y datos de contacto |

Además: `/legal/<pagina>` y `/buscar?q=`.

**Rutas antiguas** (siguen funcionando y redirigen sin romper enlaces):

| Antes | Ahora |
|---|---|
| `/tecnicas`, `/tecnicas/agua-dulce` | `/tecnicas-y-especies#tecnicas` (con `?agua=` si procede) |
| `/especies`, `/especies/agua-salada` | `/tecnicas-y-especies#especies` (con `?agua=` si procede) |
| `/tu-equipo?…` | `/encuentra-tu-equipo?…` (conserva la selección) |
| `/journal`, `/journal/<slug>` | Guía de la técnica o especie del artículo, o `/tecnicas-y-especies` |

## Portada

Orden: portada → **New In** → **Productos destacados** → *¿No sabes qué señuelo elegir?* (presentación del recomendador) → acceso a *Encuentra tu equipo* → *Follow the adventure*.

- **New In:** selección editorial en `site.home.newIn` (ids, en orden). Si añades `addedAt: 'AAAA-MM-DD'` a los productos con su fecha real de incorporación, New In pasa a mostrar automáticamente los más recientes. No se inventan fechas.
- **Productos destacados:** productos con `featured: true`, sin repetir los de New In (máximo `site.home.featuredMax`).
- **Precio:** si un producto tiene `price` (número), aparece en su tarjeta. Hoy ninguno lo tiene.

## Journal

Los artículos se conservan en `journal` (`data.js`) pero no son públicos: no aparecen en el menú, el pie, el buscador ni el sitemap, y sus URLs redirigen. Para volver a publicarlo: `site.features.journal = true` (y añadir el enlace al menú si se quiere).

## Cómo editar el contenido

Todo está en `assets/js/data.js`.

- **Productos de ejemplo.** Los productos, medidas y especificaciones actuales son de muestra: sustitúyelos por el catálogo real.
- **Relaciones.** Cada producto declara `techniques`, `species` y `conditions`. Con eso aparece automáticamente en su técnica, su especie, el buscador y "Tu equipo". `related` construye el bloque *También puedes necesitar* y `pairs` indica las cabezas plomadas compatibles con un vinilo.
- **Dónde comprar.** `listings: { wallapop: 'URL del anuncio', vinted: '' }`. Solo aparece un botón por cada plataforma incluida. Si el enlace está vacío se usa el perfil definido en `site.platforms`. Si una plataforma no aparece en `listings`, no se muestra su botón.
- **Fotografía real.** Añade `photo: 'assets/photos/paddle-tail-90.avif'` a un producto, técnica, especie, categoría o artículo y sustituirá a la ilustración (con `loading="lazy"`). Formatos recomendados: AVIF o WebP.
- **Contacto y redes.** `site.email`, `site.instagram`, `site.whatsapp` (vacío = oculto).
- **Datos legales.** `site.legal`: razón social, CIF/NIF, dirección, email, teléfono, responsable y dominio. Hasta completarlos aparecen resaltados entre corchetes (p. ej. `[RAZÓN SOCIAL]`) en las páginas legales. Los textos legales son una base orientativa y conviene que los revise una asesoría.
- **Sitemap.** Después de cambiar datos, ejecuta `node tools/build-sitemap.mjs`.

## Agua dulce y agua salada

El tipo de agua es una **dimensión transversal**, no una sección ni una pregunta del recomendador.

- **Modelo:** productos, técnicas, especies y escenarios tienen `waterTypes: [FW]`, `[SW]` o `[FW, SW]`. Una entidad multiagua existe una sola vez y aparece en ambos contextos.
- **Navegación:** es un filtro, no una sección. En Equipamiento se elige en el desplegable "Tipo de agua" (`/equipamiento/agua-dulce`, `/equipamiento/senuelos?agua=dulce`…); en Técnicas y especies, con el selector de agua (`/tecnicas-y-especies?agua=dulce`).
- **Recomendador:** sigue siendo Especie → Escenario → Técnica (→ Peso de lance, solo si hay señuelos con peso). El tipo de agua se infiere de lo elegido y filtra productos, escenarios y técnicas compatibles. Los huecos del equipo se configuran en `site.kitSlots`.
- **Añadir una especie, técnica o escenario:** basta con añadirlo a `data.js` con su `waterTypes` y sus relaciones (`techniques`, `scenarios`). No hace falta tocar la lógica.
- **Comprobación:** `node tools/validate-data.mjs` detecta ids duplicados, referencias rotas y relaciones entre aguas incompatibles.
- **Clasificación y revisión pendiente:** [docs/clasificacion-tipo-agua.md](docs/clasificacion-tipo-agua.md).

## Preparado para crecer

- **Ecommerce (fase 2).** Los productos ya tienen `price`, `sku` y `stock` (a `null`) y existe `site.features.commerce`. La interfaz no los muestra mientras sea `false`.
- **Nuevas líneas.** `site.lines` contiene Fishing (activa) y Outdoor, Trekking, Camping y Lifestyle (inactivas). Las líneas inactivas no se muestran, así que no hay categorías vacías.

## Pendiente antes de publicar

1. Sustituir los productos de ejemplo y las ilustraciones por el catálogo y la fotografía reales.
2. Completar `site.legal` y los enlaces de plataformas y redes.
3. Conectar el formulario de contacto a un backend o servicio (Formspree, Netlify Forms…). Ahora mismo abre el cliente de correo con el mensaje preparado.
4. SEO: la web cambia título, descripción, canonical y JSON-LD en cada ruta desde el navegador. Para el mejor posicionamiento conviene prerenderizar las rutas (con un generador estático o SSR) cuando el catálogo sea definitivo.
