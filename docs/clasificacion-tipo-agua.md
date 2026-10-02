# Clasificación por tipo de agua

Cada producto, técnica, especie y escenario declara `waterTypes` en `assets/js/data.js`:

- `[FW]`: solo agua dulce · `[SW]`: solo agua salada · `[FW, SW]`: multiagua (una sola ficha, aparece en ambos contextos).
- `waterReview: true`: clasificación provisional pendiente de revisión manual.

Para comprobar la coherencia de los datos tras cualquier cambio: `node tools/validate-data.mjs`.

## Técnicas

| Técnica | Tipo de agua | Nota |
|---|---|---|
| Spinning | Dulce · Salada | Una única técnica en ambos contextos |
| Light Spinning | Dulce · Salada | Usada en ríos para trucha y en puertos/espigones |
| Fly Fishing | Dulce | Nueva |
| Carpfishing | Dulce | Nueva |
| Rockfishing | Salada | |
| Eging | Salada | |
| Surfcasting | Salada | |
| Pesca desde embarcación | Salada | **Revisar:** su contenido actual es marino (jigging, veriles). Si se quiere incluir la pesca en barca en embalses, basta con añadir `FW` y adaptar el texto |

## Escenarios

- **Salada:** Costa rocosa, Playa, Espigones, Puertos, Estuarios y desembocaduras, Embarcación.
- **Dulce (nuevos):** Río, Arroyo, Lago, Embalse.
- **Condiciones multiagua:** Aguas calmas, Noche y baja luz, Aguas profundas, Con corriente (nueva). "Con oleaje" es solo salada.

## Especies

- **Salada:** Lubina, Jurel, Dorada, Anjova, Calamar, Sepia y otros cefalópodos, Otros depredadores.
- **Dulce (nuevas):** Trucha, Lucio, Black bass, Carpa, Barbo, Siluro. Cada una declara sus escenarios en `scenarios`.

## Productos existentes

### Multiagua (`[FW, SW]`): material genérico válido en cualquier agua
Arc 3000, Arc 2500S, Arc 1000 (carretes sellados contra la sal, válidos también en agua dulce) · Braid X8 PE 0.8, Braid X4 PE 0.3, Fluorocarbono 0,25, Mono 0,30 · Jig Head 3/7/10/21 g · Grapa rápida nº 1, Giratorio rolling nº 8 · Caja organizadora, Alicates, Mochila Coastline, Bolsa Tide, Gafas polarizadas.

Aparecen en los dos catálogos y en "Tu equipo" de agua dulce cuando coincide la técnica. **No se les han añadido especies de agua dulce**: sus especies siguen siendo las que tenían.

### Solo agua salada (`[SW]`): diseñados para el mar
Egi Night 3.0, Egi Dawn 2.5, Jibionera Classic 8, Sabiki Jurel nº 8, Blade Jig 30, Slow Pitch 60 · Ridge 902M (caña de costa), Rockline 742UL, Tide Egi 862M, Shore 4203, Deep 662MH · Longshore 8000 · Puente cónico 0,26–0,57 · Anzuelo Chinu nº 2.

### Pendientes de revisión (`[SW]` + `waterReview: true`)
Señuelos y una caña que se usan también en agua dulce, pero cuya ficha actual solo habla de pesca marina. Se mantienen en agua salada para que todo siga funcionando igual. Si se confirman como multiagua, hay que cambiar a `[FW, SW]` y, si procede, añadir especies de agua dulce:

| Producto | Motivo |
|---|---|
| Paddle Tail 90, Slim Shad 120, Pin Tail 55 | Los vinilos se usan para black bass, lucio o trucha |
| Minnow Kingdom 105S (6 colores) | Los minnows hundidos se usan para lucio, black bass o trucha grande |
| Walker 120 | Los paseantes se usan para black bass |
| Micro Jig 10 | Se usa para black bass y perca |
| Vibe 70 | Los lipless se usan para black bass |
| Drift 762L | Una caña de light spinning de 3–15 g sirve para trucha |

## Productos nuevos de agua dulce: DATOS DE EJEMPLO
Marcados con `sample: true`. Son necesarios para que la estructura de agua dulce funcione de principio a fin. Sustituirlos por el catálogo real:

Cucharilla Spin 2, Jerkbait 110SP, Craw 75, Ninfa Pheasant Tail nº 14, Mosca seca Adams nº 16, Brook 905 #5, Stream 602UL, Lakeside 702M, Carp 12 3 lb, Brook Fly 5/6, Big Pit 10000, Línea de mosca WF5F, Bajo cónico 9 ft 5X, Bajo de acero 30 cm, Mono Carp 0,35, Montaje de pelo nº 6, Boilies 20 mm.
