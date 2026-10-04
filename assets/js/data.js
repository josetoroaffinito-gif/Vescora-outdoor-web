/*
 * VESCORA — Datos del catálogo.
 *
 * Toda la web se genera a partir de este archivo. Las relaciones
 * PRODUCTO → TÉCNICA → ESPECIE → CONDICIONES viven en cada producto
 * (techniques / species / conditions), de modo que el mismo producto
 * aparece desde el catálogo, desde cada técnica y desde cada especie.
 *
 * TIPO DE AGUA: dimensión transversal. Productos, técnicas, especies y
 * escenarios declaran `waterTypes` con uno o varios valores (FW = agua dulce,
 * SW = agua salada). Una entidad válida para ambas aguas existe UNA sola vez
 * con `waterTypes: [FW, SW]`. El recomendador infiere el tipo de agua a partir
 * de especie + escenario + técnica: nunca se pregunta al usuario.
 * `waterReview: true` marca clasificaciones pendientes de revisión manual
 * (ver docs/clasificacion-tipo-agua.md).
 *
 * Los productos incluidos son DATOS DE EJEMPLO: sustituir por el catálogo real.
 * Campos preparados para una futura fase ecommerce (price, sku, stock) se
 * mantienen a null y la interfaz no los muestra mientras commerce=false.
 */
(function () {
  const FW = 'freshwater', SW = 'saltwater';

  const site = {
    name: 'VESCORA',
    tagline: 'Equipment for the wild',
    // Dominio definitivo (canonical, sitemap, datos estructurados).
    domain: 'https://www.vescora.com',
    email: 'hola@vescora.com',            // EDITAR
    instagram: 'https://www.instagram.com/vescora', // EDITAR
    instagramHandle: '@vescora',          // EDITAR
    whatsapp: '',                          // EDITAR: p. ej. 'https://wa.me/34600000000' — vacío = oculto
    features: { commerce: false },         // Fase 2: activar precios / carrito / checkout
    // Tipos de agua. `q` es el valor del filtro (?agua=dulce) y `slug` la ruta (/equipamiento/agua-dulce).
    waterTypes: [
      { id: FW, name: 'Agua dulce', slug: 'agua-dulce', q: 'dulce', scene: 'river', photo: 'assets/photos/agua-dulce.webp', claim: 'Ríos, arroyos, lagos y embalses.', intro: 'Truchas en corriente, black bass en embalses, carpas en lagos. Equipamiento para pescar tierra adentro.' },
      { id: SW, name: 'Agua salada', slug: 'agua-salada', q: 'salada', scene: 'coast', photo: 'assets/photos/agua-salada.webp', claim: 'Costa, puertos, playas y embarcación.', intro: 'Lubinas en la espuma, calamares bajo las luces del puerto, doradas desde la playa. Equipamiento para el mar.' }
    ],
    // Huecos que rellena "Tu equipo". Cada hueco elige el producto mejor puntuado que encaje con
    // técnica + tipo de agua (+ especie si `species`). `ifNoLure`: solo para pesca sin señuelo (cebo).
    kitSlots: [
      { role: 'Señuelo', category: 'senuelos', species: true, lure: true },
      { role: 'Cebo', category: 'accesorios', subs: ['cebos'], species: true, ifNoLure: true },
      { role: 'Anzuelo', category: 'accesorios', subs: ['anzuelos'], ifNoLure: true },
      { role: 'Bajo', category: 'lineas', subs: ['fluorocarbono', 'bajos'] },
      { role: 'Conexión', category: 'accesorios', subs: ['grapas', 'giratorios'] },
      { role: 'Línea madre', category: 'lineas', subs: ['trenzado', 'monofilamento', 'linea-mosca'] },
      { role: 'Caña', category: 'canas', rod: true },
      { role: 'Carrete', category: 'carretes' }
    ],
    // Líneas de marca. Solo se muestran las activas: el resto está preparado para el futuro.
    lines: [
      { id: 'fishing', name: 'Fishing', active: true },
      { id: 'outdoor', name: 'Outdoor', active: false },
      { id: 'trekking', name: 'Trekking', active: false },
      { id: 'camping', name: 'Camping', active: false },
      { id: 'lifestyle', name: 'Lifestyle', active: false }
    ],
    // Plataformas externas de venta. 'profile' se usa cuando un producto
    // está disponible en la plataforma pero aún no tiene enlace de anuncio propio.
    platforms: {
      wallapop: { name: 'Wallapop', profile: 'https://es.wallapop.com/' },      // EDITAR: perfil de VESCORA
      vinted: { name: 'Vinted', profile: 'https://www.vinted.es/' },            // EDITAR
      miraanuncio: { name: 'Mira Anuncio', profile: '' },                        // EDITAR: URL de la plataforma
      otras: { name: 'Otras plataformas', profile: '' }                          // EDITAR
    },
    // Datos legales: NO se inventan. Completar antes de publicar.
    legal: {
      razonSocial: '[RAZÓN SOCIAL]',
      nif: '[CIF/NIF]',
      direccion: '[DIRECCIÓN POSTAL COMPLETA]',
      email: '[EMAIL DE CONTACTO LEGAL]',
      telefono: '[TELÉFONO]',
      responsable: '[NOMBRE DEL RESPONSABLE]',
      dominio: '[DOMINIO]',
      registro: '[DATOS REGISTRALES, SI PROCEDE]',
      actualizado: '[FECHA DE ÚLTIMA ACTUALIZACIÓN]'
    }
  };

  const categories = [
    {
      id: 'senuelos', name: 'Señuelos', claim: 'La última decisión antes del lance.',
      intro: 'Vinilos, minnows, paseantes, jigs y jibioneras seleccionados por su nado, su lance y su resistencia al uso real.',
      scene: 'rock',
      sub: [
        { id: 'vinilos', name: 'Vinilos' }, { id: 'minnows', name: 'Minnows' }, { id: 'paseantes', name: 'Paseantes' },
        { id: 'jigs', name: 'Jigs' }, { id: 'vibration', name: 'Vibration' }, { id: 'jibioneras', name: 'Jibioneras' }, { id: 'otros', name: 'Otros' },
        { id: 'cucharillas', name: 'Cucharillas' }, { id: 'moscas', name: 'Moscas' }
      ]
    },
    {
      id: 'canas', name: 'Cañas', claim: 'Sensibilidad donde importa. Reserva cuando hace falta.',
      intro: 'Blanks pensados para cada técnica: acción, potencia y longitud equilibradas para lanzar lejos y sentir cada toque.',
      scene: 'coast',
      sub: [
        { id: 'rockfishing', name: 'Rockfishing' }, { id: 'light-spinning', name: 'Light Spinning' }, { id: 'spinning', name: 'Spinning' },
        { id: 'eging', name: 'Eging' }, { id: 'surfcasting', name: 'Surfcasting' }, { id: 'embarcacion', name: 'Embarcación' },
        { id: 'mosca', name: 'Mosca' }, { id: 'carpfishing', name: 'Carpfishing' }
      ]
    },
    {
      id: 'carretes', name: 'Carretes', claim: 'Recuperación fina, freno constante.',
      intro: 'Carretes que acompañan a la caña: recogida suave, freno progresivo y protección frente a la sal.',
      scene: 'harbor',
      sub: [{ id: 'spinning', name: 'Spinning' }, { id: 'surfcasting', name: 'Surfcasting' }, { id: 'eging', name: 'Eging' }, { id: 'mosca', name: 'Mosca' }, { id: 'carpfishing', name: 'Carpfishing' }]
    },
    {
      id: 'lineas', name: 'Líneas', claim: 'Lo único que te une al pez.',
      intro: 'Trenzados, fluorocarbonos, monofilamentos y bajos elegidos por su resistencia a la abrasión y su comportamiento en el agua.',
      scene: 'river',
      sub: [{ id: 'trenzado', name: 'Trenzado' }, { id: 'fluorocarbono', name: 'Fluorocarbono' }, { id: 'monofilamento', name: 'Monofilamento' }, { id: 'bajos', name: 'Bajos' }, { id: 'linea-mosca', name: 'Línea de mosca' }]
    },
    {
      id: 'accesorios', name: 'Accesorios', claim: 'Los pequeños detalles marcan la diferencia.',
      intro: 'Anzuelos, grapas, giratorios, cabezas plomadas, cajas, herramientas y equipamiento para moverte ligero.',
      scene: 'forest',
      sub: [
        { id: 'anzuelos', name: 'Anzuelos' }, { id: 'grapas', name: 'Grapas' }, { id: 'giratorios', name: 'Giratorios' },
        { id: 'cabezas-plomadas', name: 'Cabezas plomadas' }, { id: 'cajas', name: 'Cajas' }, { id: 'herramientas', name: 'Herramientas' },
        { id: 'mochilas', name: 'Mochilas' }, { id: 'bolsas', name: 'Bolsas' }, { id: 'complementos', name: 'Complementos' },
        { id: 'cebos', name: 'Cebos' }
      ]
    }
  ];

  // Escenarios y condiciones reutilizables (relación PRODUCTO → CONDICIONES).
  // Escenarios (`scenario: true`) y condiciones. `waterTypes` indica en qué aguas existen.
  const conditions = [
    { id: 'costa-rocosa', name: 'Costa rocosa', scenario: true, waterTypes: [SW] },
    { id: 'playa', name: 'Playa', scenario: true, waterTypes: [SW] },
    { id: 'espigon', name: 'Espigones', scenario: true, waterTypes: [SW] },
    { id: 'puerto', name: 'Puertos', scenario: true, waterTypes: [SW] },
    { id: 'estuario', name: 'Estuarios y desembocaduras', scenario: true, waterTypes: [SW] },
    { id: 'embarcacion', name: 'Embarcación', scenario: true, waterTypes: [SW] },
    { id: 'rio', name: 'Río', scenario: true, waterTypes: [FW] },
    { id: 'arroyo', name: 'Arroyo', scenario: true, waterTypes: [FW] },
    { id: 'lago', name: 'Lago', scenario: true, waterTypes: [FW] },
    { id: 'embalse', name: 'Embalse', scenario: true, waterTypes: [FW] },
    { id: 'oleaje', name: 'Con oleaje', waterTypes: [SW] },
    { id: 'aguas-calmas', name: 'Aguas calmas', waterTypes: [FW, SW] },
    { id: 'noche', name: 'Noche y baja luz', waterTypes: [FW, SW] },
    { id: 'profundidad', name: 'Aguas profundas', waterTypes: [FW, SW] },
    { id: 'corriente', name: 'Con corriente', waterTypes: [FW, SW] }
  ];

  const techniques = [
    {
      id: 'spinning', name: 'Spinning', waterTypes: [FW, SW], scene: 'coast', photo: 'assets/photos/tecnica-spinning.webp',
      claim: 'Una técnica versátil para buscar depredadores en diferentes escenarios.',
      type: 'Pesca activa con señuelos artificiales',
      scenario: 'Costa, playas y espigones · ríos, lagos y embalses',
      intro: 'Lanzar, recuperar y volver a lanzar. El spinning consiste en recorrer el agua con señuelos que imitan presas para provocar el ataque de los depredadores. Es la técnica que más terreno cubre y la mejor puerta de entrada a la pesca con artificiales.',
      gear: [['Caña', '2,40 – 3,00 m · 10–40 g'], ['Carrete', 'Tamaño 3000 – 4000'], ['Línea madre', 'Trenzado PE 0.8 – 1.2'], ['Bajo', 'Fluorocarbono 0,25 – 0,35 mm']],
      tips: ['Empieza cubriendo agua con un minnow o un vinilo y ajusta el gramaje a la distancia y al oleaje.', 'Las horas de luz cambiante —amanecer y atardecer— suelen ser las más activas.', 'Varía el ritmo de recuperación antes de cambiar de señuelo.']
    },
    {
      id: 'light-spinning', name: 'Light Spinning', waterTypes: [FW, SW], scene: 'harbor', photo: 'assets/photos/tecnica-light-spinning.webp',
      claim: 'Equipos ligeros, señuelos pequeños y mucha sensibilidad.',
      type: 'Spinning ligero con señuelos de 3 a 15 g',
      scenario: 'Puertos, espigones y calas · ríos y arroyos',
      intro: 'El light spinning reduce el equipo para disfrutar de cada pez y llegar a especies que no atacan señuelos grandes. Vinilos pequeños, micro jigs y minnows compactos con cañas de acción rápida y líneas finas.',
      gear: [['Caña', '2,10 – 2,40 m · 3–15 g'], ['Carrete', 'Tamaño 2000 – 2500'], ['Línea madre', 'Trenzado PE 0.3 – 0.6'], ['Bajo', 'Fluorocarbono 0,18 – 0,25 mm']],
      tips: ['Un bajo de fluorocarbono fino marca la diferencia en aguas claras.', 'Las luces de los puertos concentran peces pasto y depredadores al anochecer.', 'Trabaja el fondo y la media agua antes de cambiar de zona.']
    },
    {
      id: 'rockfishing', name: 'Rockfishing', waterTypes: [SW], scene: 'rock', photo: 'assets/photos/tecnica-rockfishing.jpg',
      claim: 'Pescar entre piedras, grieta a grieta.',
      type: 'Pesca ultraligera junto a la roca',
      scenario: 'Escolleras, bloques, pozas y bajos rocosos',
      intro: 'El rockfishing explora la estructura: grietas, huecos y paredes de roca donde viven depredadores de fondo. Se pesca cerca, con precisión y con señuelos de apenas unos gramos.',
      gear: [['Caña', '1,80 – 2,30 m · 0,5–10 g'], ['Carrete', 'Tamaño 1000 – 2000'], ['Línea madre', 'Trenzado PE 0.2 – 0.4'], ['Bajo', 'Fluorocarbono 0,16 – 0,22 mm']],
      tips: ['Deja caer el señuelo pegado a la pared y mantén contacto con la línea.', 'Una cabeza plomada ligera enroca menos que una pesada.', 'Mueve los pies: cada hueco se prueba con pocos lances.']
    },
    {
      id: 'eging', name: 'Eging', waterTypes: [SW], scene: 'night', photo: 'assets/photos/tecnica-eging.jpg',
      claim: 'El arte japonés de pescar calamares con egi.',
      type: 'Pesca de cefalópodos con egi',
      scenario: 'Puertos, escolleras y fondos de pradera',
      intro: 'El eging utiliza la egi, un señuelo con forma de gamba, para provocar a calamares y sepias. Tirones secos de caña, caídas controladas y mucha atención a la línea: la picada suele llegar mientras la egi desciende.',
      gear: [['Caña', '2,40 – 2,70 m · egi 2.5 – 3.5'], ['Carrete', 'Tamaño 2500 bobina baja'], ['Línea madre', 'Trenzado PE 0.6 – 0.8'], ['Bajo', 'Fluorocarbono 0,22 – 0,28 mm']],
      tips: ['Cuenta la caída para conocer la profundidad y no tocar fondo.', 'Colores naturales de día, colores vivos o luminiscentes de noche.', 'Tras la picada, mantén la tensión constante: el calamar no está anzuelado como un pez.']
    },
    {
      id: 'surfcasting', name: 'Surfcasting', waterTypes: [SW], scene: 'beach', photo: 'assets/photos/tecnica-surfcasting.jpg',
      claim: 'Lances largos desde la orilla.',
      type: 'Pesca a fondo desde playa',
      scenario: 'Playas abiertas, desembocaduras y rompientes',
      intro: 'El surfcasting busca a los peces que se acercan a la orilla con el movimiento del mar. Cañas largas, plomos pesados y lances potentes para situar el cebo más allá de la rompiente.',
      gear: [['Caña', '4,20 – 4,50 m · 100–250 g'], ['Carrete', 'Tamaño 6000 – 8000 bobina cónica'], ['Línea madre', 'Monofilamento 0,25 – 0,30 mm'], ['Bajo', 'Puente cónico 0,26 – 0,57 mm']],
      tips: ['Un puente cónico protege la línea en el momento del lance.', 'Con mar de fondo, los peces se acercan a la primera y segunda rompiente.', 'Observa la playa con marea baja para localizar canales y hoyas.']
    },
    {
      id: 'embarcacion', name: 'Pesca desde embarcación', waterTypes: [SW], scene: 'boat', photo: 'assets/photos/tecnica-embarcacion.jpg',
      claim: 'Llegar donde la orilla no alcanza.',
      type: 'Jigging, spinning y fondo desde barco o kayak',
      scenario: 'Bajos, veriles, cardúmenes y aguas profundas',
      intro: 'Desde la embarcación el escenario se amplía: bajos alejados, cardúmenes en superficie y fondos profundos. Equipos cortos y potentes para trabajar jigs en vertical o lanzar a peces activos.',
      gear: [['Caña', '1,80 – 2,10 m · 20–80 g'], ['Carrete', 'Tamaño 4000 – 5000'], ['Línea madre', 'Trenzado PE 1.0 – 1.5'], ['Bajo', 'Fluorocarbono 0,35 – 0,45 mm']],
      tips: ['Usa la sonda para localizar el pasto antes de pescar.', 'Ajusta el peso del jig a la deriva y a la corriente, no solo a la profundidad.', 'Revisa nudos y anillas tras cada pez grande.']
    },
    {
      id: 'fly-fishing', name: 'Fly Fishing', waterTypes: [FW], scene: 'river', photo: 'assets/photos/tecnica-fly-fishing.webp',
      claim: 'Pesca a mosca: precisión, lectura del agua y presentaciones delicadas.',
      type: 'Pesca con mosca artificial y línea de mosca',
      scenario: 'Ríos, arroyos y lagos de montaña',
      intro: 'En la pesca a mosca el peso está en la línea, no en el señuelo. Se lanzan moscas secas, ninfas o streamers que imitan insectos y pequeños peces. Es una técnica de observación: leer la corriente, encontrar la postura del pez y presentar sin que sospeche.',
      gear: [['Caña', '2,40 – 2,75 m · línea #4 – #6'], ['Carrete', 'Carrete de mosca #4 – #6'], ['Línea madre', 'Línea de mosca WF flotante'], ['Bajo', 'Bajo cónico 9 ft · 4X – 6X']],
      tips: ['Observa antes de lanzar: las cebadas en superficie indican qué mosca usar.', 'Lanza aguas arriba y deja derivar la mosca de forma natural.', 'Un bajo más fino da presentaciones más discretas en aguas claras.']
    },
    {
      id: 'carpfishing', name: 'Carpfishing', waterTypes: [FW], scene: 'forest', photo: 'assets/photos/tecnica-carpfishing.jpg',
      claim: 'Paciencia, cebado y equipos pensados para peces grandes.',
      type: 'Pesca a fondo con cebo y montaje de pelo',
      scenario: 'Lagos, embalses y tramos lentos de río',
      intro: 'El carpfishing busca carpas de gran tamaño con cebos como boilies y montajes de pelo. Se ceba una zona, se colocan las cañas en el soporte y se espera la picada. Pesca de esperas largas y combates potentes.',
      gear: [['Caña', '3,60 – 3,90 m · 2,75 – 3,5 lb'], ['Carrete', 'Big pit 8000 – 12000'], ['Línea madre', 'Monofilamento 0,30 – 0,40 mm'], ['Bajo', 'Montaje de pelo · terminal trenzado']],
      tips: ['Localiza cambios de fondo y orillas con vegetación antes de cebar.', 'Ceba con moderación: es mejor quedarse corto que saciar a los peces.', 'Trata las capturas con cuidado: moqueta de recepción y suelta rápida.']
    }
  ];

  const species = [
    {
      id: 'lubina', name: 'Lubina', waterTypes: [SW], latin: 'Dicentrarchus labrax', scene: 'coast', photo: 'assets/photos/especie-lubina.webp',
      claim: 'La reina del spinning costero.',
      intro: 'Depredador desconfiado y oportunista. Recorre la costa siguiendo al pasto y aprovecha la espuma, las corrientes y la baja luz para cazar cerca de la orilla.',
      techniques: ['spinning', 'light-spinning', 'rockfishing'],
      conditions: [
        ['Costa', 'Busca rompientes, espuma y zonas donde el agua se mueve.'],
        ['Roca', 'Puntas y bajos con corriente: la lubina espera al pasto a su paso.'],
        ['Espigones', 'Pesca la punta y los laterales en marea cambiante.'],
        ['Puertos', 'Bocanas y zonas iluminadas al anochecer.'],
        ['Oleaje', 'El mar movido suele activarla. Aumenta gramaje para mantener el control.'],
        ['Profundidad', 'Generalmente entre 0 y 5 m. Minnows y vinilos en la capa superior.']
      ]
    },
    {
      id: 'jurel', name: 'Jurel', waterTypes: [SW], latin: 'Trachurus trachurus', scene: 'harbor', photo: 'assets/photos/especie-jurel.webp',
      claim: 'Pequeño, rápido y en bancos.',
      intro: 'Pez gregario que se mueve en bancos. Muy activo al atardecer y de noche bajo las luces de los puertos, perfecto para el light spinning.',
      techniques: ['light-spinning', 'rockfishing', 'embarcacion'],
      conditions: [
        ['Costa', 'Calas abrigadas con pasto pequeño.'],
        ['Roca', 'Escolleras con agua profunda cerca.'],
        ['Espigones', 'Puntas y bocanas con corriente.'],
        ['Puertos', 'Luces nocturnas: el mejor escenario.'],
        ['Oleaje', 'Prefiere aguas tranquilas.'],
        ['Profundidad', 'Media agua. Cuenta la caída hasta encontrar el banco.']
      ]
    },
    {
      id: 'dorada', name: 'Dorada', waterTypes: [SW], latin: 'Sparus aurata', scene: 'beach', photo: 'assets/photos/especie-dorada.webp',
      claim: 'Fuerza y desconfianza en aguas someras.',
      intro: 'Espárido potente que se alimenta de moluscos y crustáceos. Se acerca a playas, estuarios y escolleras en busca de comida, sobre todo con aguas templadas.',
      techniques: ['surfcasting', 'embarcacion', 'light-spinning'],
      conditions: [
        ['Costa', 'Playas con fondos mixtos de arena y piedra.'],
        ['Roca', 'Pies de escollera con mejillón.'],
        ['Espigones', 'Laterales con fondo de arena.'],
        ['Puertos', 'Zonas con fondo de fango y aguas tranquilas.'],
        ['Oleaje', 'Mar tranquilo o de fondo suave.'],
        ['Profundidad', 'De 1 a 10 m. Pesca a fondo.']
      ]
    },
    {
      id: 'anjova', name: 'Anjova', waterTypes: [SW], latin: 'Pomatomus saltatrix', scene: 'coast', photo: 'assets/photos/especie-anjova.webp',
      claim: 'Velocidad, dientes y ataques violentos.',
      intro: 'Cazadora rápida y agresiva que persigue bancos de pasto en superficie. Sus dientes exigen un bajo resistente y señuelos robustos.',
      techniques: ['spinning', 'embarcacion'],
      conditions: [
        ['Costa', 'Playas y puntas cuando entra el pasto.'],
        ['Roca', 'Puntas con agua profunda.'],
        ['Espigones', 'Bocanas al amanecer.'],
        ['Puertos', 'Entradas de puerto persiguiendo lisas y sardinas.'],
        ['Oleaje', 'Tolera mar movido.'],
        ['Profundidad', 'Superficie y media agua. Recuperaciones rápidas.']
      ]
    },
    {
      id: 'calamar', name: 'Calamar', waterTypes: [SW], latin: 'Loligo vulgaris', scene: 'night', photo: 'assets/photos/especie-calamar.webp',
      claim: 'El objetivo del eging.',
      intro: 'Cefalópodo que se acerca a la costa al caer la noche. Ataca presas en movimiento y suele hacerlo durante la caída de la egi.',
      techniques: ['eging', 'embarcacion'],
      conditions: [
        ['Costa', 'Calas con praderas de posidonia.'],
        ['Roca', 'Escolleras con fondos limpios cerca.'],
        ['Espigones', 'Puntas con luz artificial.'],
        ['Puertos', 'Zonas iluminadas, de noche.'],
        ['Oleaje', 'Mejor con mar en calma y agua clara.'],
        ['Profundidad', 'De 2 a 15 m. Controla la caída.']
      ]
    },
    {
      id: 'cefalopodos', name: 'Sepia y otros cefalópodos', waterTypes: [SW], latin: 'Sepia officinalis · Octopus vulgaris', scene: 'harbor', photo: 'assets/photos/especie-cefalopodos.webp',
      claim: 'Pesca pausada, cerca del fondo.',
      intro: 'Sepias y pulpos viven pegados al fondo. Responden a egis y jibioneras trabajadas despacio, con pausas largas y contacto con el fondo.',
      techniques: ['eging', 'embarcacion'],
      conditions: [
        ['Costa', 'Fondos de arena y pradera.'],
        ['Roca', 'Pulpo en huecos y bloques.'],
        ['Espigones', 'Laterales con arena.'],
        ['Puertos', 'Fondos tranquilos y limpios.'],
        ['Oleaje', 'Aguas calmas.'],
        ['Profundidad', 'Siempre cerca del fondo.']
      ]
    },
    {
      id: 'depredadores', name: 'Otros depredadores', waterTypes: [SW], latin: 'Serranos, cabrachos, palometas, bonitos…', scene: 'rock', photo: 'assets/photos/especie-depredadores.webp',
      claim: 'La costa está llena de cazadores.',
      intro: 'Serranos y cabrachos entre las piedras; palometas, bonitos y caballas en superficie. Cada uno tiene su técnica, pero todos responden a un señuelo bien presentado.',
      techniques: ['rockfishing', 'light-spinning', 'spinning', 'embarcacion'],
      conditions: [
        ['Costa', 'Calas y puntas con pasto.'],
        ['Roca', 'Grietas y huecos: territorio del rockfishing.'],
        ['Espigones', 'Pies de escollera.'],
        ['Puertos', 'Bocanas y estructuras sumergidas.'],
        ['Oleaje', 'Depende de la especie.'],
        ['Profundidad', 'Del fondo a la superficie.']
      ]
    },
    // ——— AGUA DULCE. `scenarios` declara dónde vive la especie (además de lo que se deduce de los productos).
    {
      id: 'trucha', name: 'Trucha', waterTypes: [FW], latin: 'Salmo trutta', scene: 'river', photo: 'assets/photos/especie-trucha.webp',
      scenarios: ['rio', 'arroyo', 'lago', 'embalse'],
      claim: 'La especie de los ríos de montaña.',
      intro: 'Depredador de aguas frías y oxigenadas. Se aposta en corrientes, pozas y remansos esperando la comida que trae el agua. Desconfiada: la presentación lo es todo.',
      techniques: ['fly-fishing', 'spinning', 'light-spinning'],
      conditions: [
        ['Río', 'Cabeceras de corriente, pozas y orillas con sombra.'],
        ['Arroyo', 'Aguas pequeñas: acércate sin ser visto.'],
        ['Lago', 'Desembocaduras de arroyos y orillas al amanecer.'],
        ['Embalse', 'Colas de embalse y entradas de agua.'],
        ['Corriente', 'Busca donde la corriente rompe y deja un remanso.'],
        ['Profundidad', 'Superficie con eclosiones; fondo con agua fría.']
      ]
    },
    {
      id: 'lucio', name: 'Lucio', waterTypes: [FW], latin: 'Esox lucius', scene: 'forest', photo: 'assets/photos/especie-lucio.webp',
      scenarios: ['embalse', 'lago', 'rio'],
      claim: 'Emboscada, dientes y ataques explosivos.',
      intro: 'Gran depredador de emboscada. Espera junto a vegetación y estructura para atacar a cualquier pez que pase. Sus dientes obligan a usar bajo de acero.',
      techniques: ['spinning'],
      conditions: [
        ['Embalse', 'Zonas con vegetación sumergida y árboles caídos.'],
        ['Lago', 'Bordes de carrizo y praderas de plantas.'],
        ['Río', 'Tramos lentos y remansos profundos.'],
        ['Estructura', 'Ramas, juncos y cambios de fondo.'],
        ['Época', 'Especialmente activo en otoño y primavera.'],
        ['Profundidad', 'De 1 a 6 m según la época.']
      ]
    },
    {
      id: 'black-bass', name: 'Black bass', waterTypes: [FW], latin: 'Micropterus salmoides', scene: 'forest', photo: 'assets/photos/especie-black-bass.webp',
      scenarios: ['embalse', 'lago', 'rio'],
      claim: 'El rey del spinning en embalses.',
      intro: 'Depredador ligado a la estructura: piedras, troncos, vegetación y cambios de fondo. Responde a señuelos muy variados, desde superficie hasta vinilos arrastrados por el fondo.',
      techniques: ['spinning'],
      conditions: [
        ['Embalse', 'Puntas, piedras y árboles sumergidos.'],
        ['Lago', 'Orillas con vegetación y sombra.'],
        ['Río', 'Remansos y tablas lentas.'],
        ['Estructura', 'Cuanto más cubierta, más opciones.'],
        ['Temperatura', 'Más activo con el agua templada.'],
        ['Profundidad', 'Superficie al alba; fondo en las horas centrales.']
      ]
    },
    {
      id: 'carpa', name: 'Carpa', waterTypes: [FW], latin: 'Cyprinus carpio', scene: 'forest', photo: 'assets/photos/especie-carpa.webp',
      scenarios: ['lago', 'embalse', 'rio'],
      claim: 'Fuerza, desconfianza y grandes tamaños.',
      intro: 'Pez de fondo que se alimenta removiendo el lecho. Desconfiada y potente, puede superar con creces los diez kilos. El cebado y el montaje marcan la diferencia.',
      techniques: ['carpfishing'],
      conditions: [
        ['Lago', 'Zonas de fango y orillas con vegetación.'],
        ['Embalse', 'Cambios de profundidad y playas de fondo blando.'],
        ['Río', 'Tramos lentos y profundos.'],
        ['Señales', 'Burbujas y agua removida delatan su presencia.'],
        ['Época', 'De primavera a otoño, con el agua templada.'],
        ['Profundidad', 'Siempre cerca del fondo.']
      ]
    },
    {
      id: 'barbo', name: 'Barbo', waterTypes: [FW], latin: 'Luciobarbus spp.', scene: 'river', photo: 'assets/photos/especie-barbo.webp',
      scenarios: ['rio', 'embalse'],
      claim: 'Combativo y típico de nuestros ríos.',
      intro: 'Ciprínido de fondo muy extendido en los ríos ibéricos. Busca alimento entre las piedras de la corriente y en las colas de los embalses. Ofrece combates intensos para su tamaño.',
      techniques: ['carpfishing', 'spinning'],
      conditions: [
        ['Río', 'Corrientes con fondo de grava y piedra.'],
        ['Embalse', 'Colas de embalse y entradas de río.'],
        ['Corriente', 'Le gusta el agua en movimiento.'],
        ['Época', 'Muy activo en primavera y verano.'],
        ['Agua', 'Clara o ligeramente tomada.'],
        ['Profundidad', 'Pegado al fondo.']
      ]
    },
    {
      id: 'siluro', name: 'Siluro', waterTypes: [FW], latin: 'Silurus glanis', scene: 'river', photo: 'assets/photos/especie-siluro.webp',
      scenarios: ['rio', 'embalse'],
      claim: 'El gigante de los grandes ríos.',
      intro: 'El mayor pez de agua dulce de Europa. Depredador nocturno y oportunista de grandes ríos y embalses. Exige equipos muy robustos.',
      techniques: ['spinning', 'carpfishing'],
      conditions: [
        ['Río', 'Grandes ríos con pozas profundas.'],
        ['Embalse', 'Cortados, árboles sumergidos y zonas profundas.'],
        ['Noche', 'Especialmente activo con poca luz.'],
        ['Época', 'Con el agua caliente, de primavera a otoño.'],
        ['Equipo', 'Líneas y anzuelos muy resistentes.'],
        ['Profundidad', 'Fondo y media agua.']
      ]
    }
  ];

  // Helper para no repetir estructura.
  const P = (o) => Object.assign({ price: null, sku: null, stock: null, photo: null, listings: { wallapop: '', vinted: '' } }, o);

  const products = [
    // ——— SEÑUELOS · VINILOS
    P({
      id: 'paddle-tail-90', name: 'Paddle Tail 90', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'vinilos', type: 'Soft Swimbait',
      length: '90 mm', weight: 15, featured: true,
      summary: 'El vinilo de cola de pala que nada a cualquier velocidad.',
      description: 'Un vinilo de perfil hidrodinámico y cola de pala que genera vibración desde la recuperación más lenta. Montado en cabeza plomada cubre la capa media del agua con un nado natural que imita a sardinas y lisas. Compuesto blando y resistente, preparado para varias capturas.',
      specs: { Tipo: 'Vinilo · cola de pala', Longitud: '90 mm', Peso: '15 g', Acción: 'Vibración de cola y balanceo', Material: 'Compuesto TPR suave', Color: 'Sardina natural', Profundidad: '0,5 – 4 m (según cabeza)' },
      when: { Condiciones: 'Mar en calma o ligeramente movido', 'Tipo de agua': 'Clara o ligeramente tomada', Profundidad: 'Media agua', Recuperación: 'Lineal lenta o con tirones suaves', Escenario: 'Costa rocosa, espigones y bocanas' },
      techniques: ['spinning', 'light-spinning', 'rockfishing'], species: ['lubina', 'jurel', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'espigon', 'puerto', 'estuario', 'aguas-calmas'],
      pairs: ['jig-head-10', 'jig-head-7', 'jig-head-21'],
      related: ['jig-head-10', 'fluoro-025', 'grapa-rapida-1', 'giratorio-rolling', 'caja-organizadora'],
      art: { k: 'softbait', c: ['#8fa3ad', '#dfe6e6'] }, listings: { wallapop: '', vinted: '', miraanuncio: '' }
    }),
    P({
      id: 'slim-shad-120', name: 'Slim Shad 120', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'vinilos', type: 'Soft Shad',
      length: '120 mm', weight: 22,
      summary: 'Silueta grande para lances largos y lubinas selectivas.',
      description: 'Shad de perfil estilizado para buscar peces grandes con mar movido. Su cola genera un balanceo amplio y su tamaño permite lanzar lejos con cabezas de 14 a 28 g.',
      specs: { Tipo: 'Vinilo · shad', Longitud: '120 mm', Peso: '22 g', Acción: 'Balanceo amplio', Material: 'Compuesto TPR', Color: 'Lisa oscura', Profundidad: '1 – 6 m' },
      when: { Condiciones: 'Mar movido, espuma', 'Tipo de agua': 'Tomada o con espuma', Profundidad: 'Media agua a fondo', Recuperación: 'Lineal media', Escenario: 'Playas abiertas y puntas' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion', 'oleaje'],
      pairs: ['jig-head-21', 'jig-head-10'],
      related: ['jig-head-21', 'fluoro-025', 'grapa-rapida-1', 'pe-x8-08'],
      art: { k: 'shad', c: ['#4b5a52', '#c9d0c2'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'pin-tail-55', name: 'Pin Tail 55', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'vinilos', type: 'Micro vinilo',
      length: '55 mm', weight: 2,
      summary: 'Pequeño y discreto, para peces que desconfían.',
      description: 'Micro vinilo de cola fina con una vibración casi imperceptible. Pensado para light spinning y rockfishing, donde la presentación importa más que el tamaño.',
      specs: { Tipo: 'Vinilo · pin tail', Longitud: '55 mm', Peso: '1,5 g', Acción: 'Vibración fina', Material: 'Compuesto con sal', Color: 'Glow translúcido', Profundidad: 'Según cabeza' },
      when: { Condiciones: 'Aguas calmas, noche', 'Tipo de agua': 'Clara', Profundidad: 'Fondo y media agua', Recuperación: 'Muy lenta con caídas', Escenario: 'Puertos y escolleras' },
      techniques: ['light-spinning', 'rockfishing'], species: ['jurel', 'depredadores', 'lubina'],
      conditions: ['puerto', 'espigon', 'costa-rocosa', 'aguas-calmas', 'noche'],
      pairs: ['jig-head-3', 'jig-head-7'],
      related: ['jig-head-3', 'pe-x4-03', 'fluoro-025', 'caja-organizadora'],
      art: { k: 'pintail', c: ['#d7c98a', '#f1ecd4'] }, listings: { vinted: '' }
    }),
    P({
      id: 'kit-vinilos-40', name: 'Kit 40 Vinilos Paddle Tail + Caja', waterTypes: [FW, SW], category: 'senuelos', sub: 'vinilos', type: 'Kit de vinilos con montaje',
      length: '7 cm', weight: 9.2,
      photo: 'assets/photos/kit-vinilos-40-caja.webp',
      photos: ['caja', 'rosa-cristal', 'verde-chartreuse', 'oro-olivo', 'azul-naranja'].map((v) => `assets/photos/kit-vinilos-40-${v}.webp`),
      summary: 'Todo lo necesario para montar y pescar, en una sola caja.',
      description: 'Kit completo de 40 vinilos paddle tail en 8 colores, con 10 cabezas plomadas de 7 g, 10 grapas rápidas con giratorio y caja organizadora rígida. La cola de pala genera un nado natural desde la recuperación más lenta. Pensado para spinning en agua dulce y salada: costa, embarcación, río, lago o embalse.',
      specs: {
        Tipo: 'Soft swimbait · paddle tail', Contenido: '40 vinilos · 10 cabezas plomadas 7 g · 10 grapas con giratorio · caja',
        Longitud: '7 cm aprox.', Peso: '2,2 g (vinilo) · 9,2 g montado', Acción: 'Cola de pala, nado natural',
        Material: 'Silicona flexible y resistente', Color: '8 colores · 5 uds por color', Caja: '18 × 10 × 4 cm · 124 g', Profundidad: '0,5 – 4 m según recuperación'
      },
      when: { Condiciones: 'Peces activos o desconfiados', 'Tipo de agua': 'Dulce o salada', Profundidad: 'Media agua y fondo', Recuperación: 'Lineal lenta o a saltos', Escenario: 'Costa, puertos, ríos y embalses' },
      techniques: ['spinning', 'light-spinning'], species: ['lubina', 'jurel', 'black-bass', 'trucha', 'depredadores'],
      conditions: ['costa-rocosa', 'espigon', 'puerto', 'rio', 'lago', 'embalse'],
      related: ['fluoro-025', 'pe-x4-03', 'drift-762l', 'lakeside-702m', 'stream-602ul'],
      art: { k: 'softbait', c: ['#e04f9a', '#f1ecd4'] }, listings: { wallapop: '', vinted: '' }
    }),
    // ——— SEÑUELOS · MINNOWS — Minnow Kingdom 105S (6 colores, misma ficha técnica)
    ...[
      ['plata-holo', 'Plata Holo', ['#9aa4b4', '#e6e9ee'], true, { wallapop: '', vinted: '', miraanuncio: '' }],
      ['lomo-rosa', 'Lomo Rosa', ['#c2185b', '#e3e3e6'], false, { wallapop: '', vinted: '' }],
      ['cabeza-roja', 'Cabeza Roja', ['#7c8a9a', '#e9d36a'], false, { wallapop: '', vinted: '' }],
      ['plata-espejo', 'Plata Espejo', ['#3c4046', '#d9dde2'], false, { wallapop: '' }],
      ['oro-rojo', 'Oro Rojo', ['#6f747a', '#b3262d'], false, { wallapop: '', vinted: '' }],
      ['sardina-azul', 'Sardina Azul', ['#1f3f8f', '#e3e6ea'], true, { wallapop: '', vinted: '' }]
    ].map(([slug, color, c, featured, listings]) => P({
      id: `minnow-kingdom-105s-${slug}`, name: `Minnow Kingdom 105S ${color}`, waterTypes: [SW], waterReview: true, family: 'minnow-kingdom-105s', color,
      category: 'senuelos', sub: 'minnows', type: 'Minnow Kingdom hundido',
      length: '10,5 cm', weight: 18.6, featured,
      photo: `assets/photos/minnow-kingdom-105s-${slug}.webp`,
      summary: 'Compacto, pesado y fácil de lanzar contra el viento.',
      description: 'Minnow hundido de perfil compacto. Alcanza distancia con viento de cara y permite contar la caída para pescar a distintas profundidades.',
      specs: { Tipo: 'Minnow Kingdom hundido', Longitud: '10,5 cm', Peso: '18,6 g', Acción: 'Rolling cerrado', Material: 'ABS · anillas inox', Color: color, Profundidad: '0,5 – 3 m' },
      when: { Condiciones: 'Viento, distancia', 'Tipo de agua': 'Clara o movida', Profundidad: 'Media agua', Recuperación: 'Lineal o con paradas', Escenario: 'Puntas, playas, embarcación' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'jurel', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion', 'oleaje'],
      related: ['grapa-rapida-1', 'fluoro-025', 'giratorio-rolling', 'pe-x8-08', 'alicates-alu'],
      art: { k: 'minnow', c }, listings
    })),
    // ——— SEÑUELOS · PASEANTES
    P({
      id: 'walker-120', name: 'Walker 120', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'paseantes', type: 'Paseante de superficie',
      length: '120 mm', weight: 21, featured: true,
      summary: 'Zig-zag en superficie. Ataques que se ven.',
      description: 'Stickbait de superficie que camina de lado a lado con un ligero toque de puntera. Ideal en amaneceres de mar en calma, cuando los depredadores persiguen pasto arriba.',
      specs: { Tipo: 'Paseante · stickbait', Longitud: '120 mm', Peso: '21 g', Acción: 'Walk the dog', Material: 'ABS · anillas inox', Color: 'Hueso', Profundidad: 'Superficie' },
      when: { Condiciones: 'Mar en calma, amanecer', 'Tipo de agua': 'Clara', Profundidad: 'Superficie', Recuperación: 'Toques rítmicos de puntera', Escenario: 'Calas, playas y bajos' },
      techniques: ['spinning'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'aguas-calmas'],
      related: ['grapa-rapida-1', 'fluoro-025', 'pe-x8-08', 'gafas-polarizadas'],
      art: { k: 'walker', c: ['#e9dcc0', '#fbf6ea'] }, listings: { wallapop: '', vinted: '' }
    }),
    // ——— SEÑUELOS · JIGS
    P({
      id: 'blade-jig-30', name: 'Blade Jig 30', waterTypes: [SW], category: 'senuelos', sub: 'jigs', type: 'Casting jig',
      length: '78 mm', weight: 30,
      summary: 'Distancia máxima y caída rápida.',
      description: 'Jig metálico de casting con centro de gravedad trasero para lanzar lejos. Destellos intensos al recuperar y una caída que provoca ataques de peces activos.',
      specs: { Tipo: 'Jig metálico', Longitud: '78 mm', Peso: '30 g', Acción: 'Destello y caída en hoja', Material: 'Zinc · acabado holográfico', Color: 'Plata / azul', Profundidad: 'Toda la columna' },
      when: { Condiciones: 'Pajareras, peces en superficie', 'Tipo de agua': 'Clara', Profundidad: 'Superficie a fondo', Recuperación: 'Rápida o con tirones', Escenario: 'Puntas, playas, embarcación' },
      techniques: ['spinning', 'embarcacion'], species: ['anjova', 'jurel', 'depredadores', 'lubina'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion', 'oleaje', 'profundidad'],
      related: ['grapa-rapida-1', 'giratorio-rolling', 'fluoro-025', 'alicates-alu'],
      art: { k: 'jig', c: ['#9fb4c7', '#2b5d8a'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'micro-jig-10', name: 'Micro Jig 10', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'jigs', type: 'Micro jig',
      length: '45 mm', weight: 10,
      summary: 'Todo el poder del jig en formato ligero.',
      description: 'Micro jig para light spinning y rockfishing. Compacto y denso: llega rápido al fondo y trabaja con pequeños tirones de muñeca.',
      specs: { Tipo: 'Micro jig', Longitud: '45 mm', Peso: '10 g', Acción: 'Aleteo en caída', Material: 'Zinc', Color: 'Glow rosa', Profundidad: 'Fondo y media agua' },
      when: { Condiciones: 'Corriente suave', 'Tipo de agua': 'Clara', Profundidad: 'Media agua a fondo', Recuperación: 'Tirones cortos y caída', Escenario: 'Puertos y escolleras' },
      techniques: ['light-spinning', 'rockfishing'], species: ['jurel', 'depredadores'],
      conditions: ['puerto', 'espigon', 'costa-rocosa', 'noche'],
      related: ['pe-x4-03', 'fluoro-025', 'grapa-rapida-1'],
      art: { k: 'jig', c: ['#e8b9c2', '#9c5d74'], small: true }, listings: { vinted: '' }
    }),
    P({
      id: 'slow-jig-60', name: 'Slow Pitch 60', waterTypes: [SW], category: 'senuelos', sub: 'jigs', type: 'Slow jig',
      length: '85 mm', weight: 60,
      summary: 'Caídas lentas para peces de fondo.',
      description: 'Jig asimétrico para slow pitch desde embarcación. Planea en la caída, justo cuando los depredadores de fondo atacan.',
      specs: { Tipo: 'Slow jig', Longitud: '85 mm', Peso: '60 g', Acción: 'Planeo lateral', Material: 'Plomo · acabado glow', Color: 'Dorado', Profundidad: '20 – 60 m' },
      when: { Condiciones: 'Deriva lenta', 'Tipo de agua': 'Cualquiera', Profundidad: 'Fondo', Recuperación: 'Tirones cortos y pausas', Escenario: 'Bajos y veriles' },
      techniques: ['embarcacion'], species: ['depredadores', 'anjova'],
      conditions: ['embarcacion', 'profundidad'],
      related: ['pe-x8-08', 'giratorio-rolling', 'alicates-alu'],
      art: { k: 'jig', c: ['#d8b96a', '#7a5a22'], wide: true }, listings: { wallapop: '' }
    }),
    // ——— SEÑUELOS · VIBRATION
    P({
      id: 'vibe-70', name: 'Vibe 70', waterTypes: [SW], waterReview: true, category: 'senuelos', sub: 'vibration', type: 'Lipless vibration',
      length: '70 mm', weight: 18,
      summary: 'Vibración intensa para aguas tomadas.',
      description: 'Señuelo sin babero con vibración de alta frecuencia y cámara de sonido. Perfecto para buscar peces en aguas tomadas o con poca visibilidad.',
      specs: { Tipo: 'Vibration', Longitud: '70 mm', Peso: '18 g', Acción: 'Vibración rápida', Material: 'ABS · bolas de sonido', Color: 'Chartreuse', Profundidad: '0,5 – 5 m' },
      when: { Condiciones: 'Agua tomada, viento', 'Tipo de agua': 'Turbia', Profundidad: 'Media agua a fondo', Recuperación: 'Lineal o yo-yo', Escenario: 'Estuarios, playas y embarcación' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'jurel'],
      conditions: ['estuario', 'playa', 'embarcacion', 'oleaje'],
      related: ['grapa-rapida-1', 'fluoro-025', 'pe-x8-08'],
      art: { k: 'vib', c: ['#c7d25a', '#f2f3dc'] }, listings: { wallapop: '', vinted: '' }
    }),
    // ——— SEÑUELOS · JIBIONERAS (egis)
    P({
      id: 'egi-30-night', name: 'Egi Night 3.0', waterTypes: [SW], category: 'senuelos', sub: 'jibioneras', type: 'Egi',
      length: '3.0', weight: 15, featured: true,
      summary: 'Egi luminiscente para calamares nocturnos.',
      description: 'Egi talla 3.0 con cuerpo luminiscente y tela de alta visibilidad. Caída estable a unos 3 s/m y corona de púas afiladas para no perder la pieza.',
      specs: { Tipo: 'Egi', Longitud: 'Talla 3.0', Peso: '15 g', Acción: 'Caída estable ~3 s/m', Material: 'ABS · tela · púas inox', Color: 'Naranja glow', Profundidad: '2 – 10 m' },
      when: { Condiciones: 'Noche, luna nueva', 'Tipo de agua': 'Clara', Profundidad: 'Media agua', Recuperación: 'Dos tirones secos y caída', Escenario: 'Puertos y escolleras iluminadas' },
      techniques: ['eging'], species: ['calamar', 'cefalopodos'],
      conditions: ['puerto', 'espigon', 'noche', 'aguas-calmas'],
      related: ['pe-x8-08', 'fluoro-025', 'grapa-rapida-1', 'bolsa-tide'],
      art: { k: 'egi', c: ['#e6793d', '#f6d7b8'] }, listings: { wallapop: '', vinted: '', miraanuncio: '' }
    }),
    P({
      id: 'egi-25-dawn', name: 'Egi Dawn 2.5', waterTypes: [SW], category: 'senuelos', sub: 'jibioneras', type: 'Egi',
      length: '2.5', weight: 10,
      summary: 'Talla ligera y colores naturales para el día.',
      description: 'Egi talla 2.5 de colores naturales para aguas claras y calamares desconfiados. Más ligera, perfecta para poca profundidad.',
      specs: { Tipo: 'Egi', Longitud: 'Talla 2.5', Peso: '10 g', Acción: 'Caída lenta ~3,5 s/m', Material: 'ABS · tela · púas inox', Color: 'Marrón natural', Profundidad: '1 – 6 m' },
      when: { Condiciones: 'Día, agua clara', 'Tipo de agua': 'Clara', Profundidad: 'Poca profundidad', Recuperación: 'Tirones suaves y pausas largas', Escenario: 'Calas y praderas' },
      techniques: ['eging'], species: ['calamar', 'cefalopodos'],
      conditions: ['costa-rocosa', 'puerto', 'aguas-calmas'],
      related: ['pe-x8-08', 'fluoro-025', 'grapa-rapida-1'],
      art: { k: 'egi', c: ['#8a6a4a', '#e8dcc6'] }, listings: { vinted: '' }
    }),
    P({
      id: 'jibionera-classic', name: 'Jibionera Classic 8', waterTypes: [SW], category: 'senuelos', sub: 'jibioneras', type: 'Jibionera',
      length: '80 mm', weight: 12,
      summary: 'La jibionera de siempre para sepias y calamares.',
      description: 'Jibionera tradicional con cuerpo luminiscente y doble corona. Para pescar a la deriva desde embarcación o en combinación con plomo desde puerto.',
      specs: { Tipo: 'Jibionera', Longitud: '80 mm', Peso: '12 g', Acción: 'Deriva', Material: 'Resina luminiscente · púas inox', Color: 'Blanco glow', Profundidad: 'Cerca del fondo' },
      when: { Condiciones: 'Noche, deriva suave', 'Tipo de agua': 'Cualquiera', Profundidad: 'Fondo', Recuperación: 'Muy lenta', Escenario: 'Embarcación y puertos' },
      techniques: ['eging', 'embarcacion'], species: ['calamar', 'cefalopodos'],
      conditions: ['embarcacion', 'puerto', 'noche'],
      related: ['mono-030', 'giratorio-rolling'],
      art: { k: 'jibionera', c: ['#eef0e6', '#9fb49a'] }, listings: { wallapop: '' }
    }),
    // ——— SEÑUELOS · OTROS
    P({
      id: 'sabiki-jurel', name: 'Sabiki Jurel nº 8', waterTypes: [SW], category: 'senuelos', sub: 'otros', type: 'Bajo de plumillas',
      length: '6 anzuelos', weight: null,
      summary: 'El clásico para bancos de jurel y caballa.',
      description: 'Bajo de seis anzuelos con plumillas y piel de pescado. Se trabaja en vertical con un plomo o micro jig en el extremo.',
      specs: { Tipo: 'Sabiki', Longitud: '1,8 m · 6 anzuelos', Peso: '—', Acción: 'Vertical', Material: 'Fluorocarbono · plumilla', Color: 'Piel natural', Profundidad: 'Media agua' },
      when: { Condiciones: 'Bancos localizados', 'Tipo de agua': 'Cualquiera', Profundidad: 'Media agua', Recuperación: 'Subidas y bajadas suaves', Escenario: 'Puertos, espigones y embarcación' },
      techniques: ['light-spinning', 'embarcacion'], species: ['jurel'],
      conditions: ['puerto', 'espigon', 'embarcacion'],
      related: ['micro-jig-10', 'giratorio-rolling'],
      art: { k: 'sabiki', c: ['#d8dde0', '#e27a6a'] }, listings: { wallapop: '', vinted: '' }
    }),

    P({
      id: 'crankbait-pack-5', name: 'Crankbait Pack 5', waterTypes: [FW, SW], category: 'senuelos', sub: 'otros', type: 'Pack de 5 crankbaits',
      length: '10 cm', weight: 13.6,
      photo: 'assets/photos/crankbait-pack-5.webp',
      summary: 'Cinco colores, un kit listo para pescar.',
      description: 'Pack de 5 crankbaits VESCORA en colores distintos para adaptarse al agua, la luz y la actividad de los peces. Babero que lo hace trabajar entre 0,5 y 1,5 m, con un nado de gran movimiento y vibración. Ideal para black bass, lucio, lucioperca y otros depredadores, tanto para quien empieza como para pescadores con experiencia.',
      specs: { Tipo: 'Crankbait', Longitud: '10 cm', Peso: '13,6 g', Acción: 'Gran movimiento y vibración', Material: 'ABS · babero de policarbonato', Anzuelos: 'Triples nº 6', Color: '5 colores surtidos', Profundidad: '0,5 – 1,5 m', Unidades: '5' },
      when: { Condiciones: 'Peces activos, agua tomada o con viento', 'Tipo de agua': 'Dulce o salada', Profundidad: '0,5 – 1,5 m', Recuperación: 'Lineal, chocando con piedras y estructura', Escenario: 'Embalses, lagos y ríos' },
      techniques: ['spinning'], species: ['black-bass', 'lucio', 'depredadores'],
      conditions: ['embalse', 'lago', 'rio'],
      related: ['grapa-rapida-1', 'fluoro-025', 'bajo-acero-30', 'lakeside-702m', 'caja-organizadora'],
      art: { k: 'minnow', c: ['#1b1d1e', '#d9d24a'] }, listings: { wallapop: '', vinted: '' }
    }),
    // ——— CAÑAS
    P({
      id: 'ridge-902m', name: 'Ridge 902M', waterTypes: [SW], category: 'canas', sub: 'spinning', type: 'Caña de spinning',
      length: '2,74 m', weightRange: [10, 35], featured: true,
      summary: 'La caña de spinning para costa.',
      description: 'Caña de dos tramos con blank de carbono de módulo medio-alto. Puntera sensible para trabajar minnows y vinilos, y reserva de potencia para peces grandes junto a la roca.',
      specs: { Tipo: 'Spinning', Longitud: '2,74 m · 2 tramos', 'Acción de lance': '10 – 35 g', Acción: 'Rápida', Material: 'Carbono · anillas SiC', 'Línea recomendada': 'PE 0.8 – 1.2', 'Peso de la caña': '165 g' },
      when: { Condiciones: 'Costa abierta, viento moderado', 'Tipo de agua': 'Cualquiera', Profundidad: 'Superficie a media agua', Recuperación: 'Lineal y jerking', Escenario: 'Costa rocosa y playas' },
      techniques: ['spinning'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'espigon', 'oleaje'],
      related: ['arc-3000', 'pe-x8-08', 'fluoro-025', 'minnow-kingdom-105s-plata-holo'],
      art: { k: 'rod', c: ['#2c3230', '#8b6d4c'] }, listings: { wallapop: '' }
    }),
    P({
      id: 'drift-762l', name: 'Drift 762L', waterTypes: [SW], waterReview: true, category: 'canas', sub: 'light-spinning', type: 'Caña de light spinning',
      length: '2,29 m', weightRange: [3, 15],
      summary: 'Ligera y sensible para señuelos pequeños.',
      description: 'Caña de light spinning con puntera sólida para sentir picadas finas. Lanza con precisión señuelos de 3 a 15 g.',
      specs: { Tipo: 'Light spinning', Longitud: '2,29 m · 2 tramos', 'Acción de lance': '3 – 15 g', Acción: 'Extra rápida', Material: 'Carbono · puntera sólida', 'Línea recomendada': 'PE 0.3 – 0.6', 'Peso de la caña': '112 g' },
      when: { Condiciones: 'Aguas abrigadas', 'Tipo de agua': 'Clara', Profundidad: 'Media agua', Recuperación: 'Lenta, tirones finos', Escenario: 'Puertos y espigones' },
      techniques: ['light-spinning'], species: ['jurel', 'depredadores', 'lubina', 'dorada'],
      conditions: ['puerto', 'espigon', 'costa-rocosa'],
      related: ['arc-2500s', 'pe-x4-03', 'fluoro-025', 'paddle-tail-90'],
      art: { k: 'rod', c: ['#3b4336', '#c9b28c'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'rockline-742ul', name: 'Rockline 742UL', waterTypes: [SW], category: 'canas', sub: 'rockfishing', type: 'Caña de rockfishing',
      length: '2,24 m', weightRange: [1, 7],
      summary: 'Precisión milimétrica entre piedras.',
      description: 'Caña ultraligera para rockfishing. Transmite cada roce con la roca y permite sacar al pez del hueco con decisión.',
      specs: { Tipo: 'Rockfishing', Longitud: '2,24 m · 2 tramos', 'Acción de lance': '0,8 – 7 g', Acción: 'Rápida', Material: 'Carbono · puntera sólida', 'Línea recomendada': 'PE 0.2 – 0.4', 'Peso de la caña': '96 g' },
      when: { Condiciones: 'Mar en calma', 'Tipo de agua': 'Clara', Profundidad: 'Fondo', Recuperación: 'Caídas y arrastres', Escenario: 'Escolleras y pozas' },
      techniques: ['rockfishing'], species: ['depredadores', 'jurel'],
      conditions: ['costa-rocosa', 'espigon', 'puerto'],
      related: ['arc-1000', 'pe-x4-03', 'jig-head-3', 'pin-tail-55'],
      art: { k: 'rod', c: ['#2a2f33', '#a58a62'] }, listings: { vinted: '' }
    }),
    P({
      id: 'tide-egi-862m', name: 'Tide Egi 862M', waterTypes: [SW], category: 'canas', sub: 'eging', type: 'Caña de eging',
      length: '2,59 m', weightRange: [10, 20],
      summary: 'Tirones secos, caída controlada.',
      description: 'Caña de eging con acción rápida para animar la egi con tirones secos y una puntera que muestra cada toque durante la caída.',
      specs: { Tipo: 'Eging', Longitud: '2,59 m · 2 tramos', 'Acción de lance': 'Egi 2.5 – 3.5', Acción: 'Rápida', Material: 'Carbono', 'Línea recomendada': 'PE 0.6 – 0.8', 'Peso de la caña': '118 g' },
      when: { Condiciones: 'Noche, mar en calma', 'Tipo de agua': 'Clara', Profundidad: 'Media agua', Recuperación: 'Tirones y caída', Escenario: 'Puertos y escolleras' },
      techniques: ['eging'], species: ['calamar', 'cefalopodos'],
      conditions: ['puerto', 'espigon', 'noche'],
      related: ['arc-2500s', 'egi-30-night', 'pe-x8-08'],
      art: { k: 'rod', c: ['#27313a', '#b7713f'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'shore-4203', name: 'Shore 4203', waterTypes: [SW], category: 'canas', sub: 'surfcasting', type: 'Caña de surfcasting',
      length: '4,20 m', weightRange: [100, 200],
      summary: 'Lances largos con control.',
      description: 'Caña de surfcasting de tres tramos con puntera de fibra para ver la picada con mar movido y un talón potente para lanzar plomos de hasta 200 g.',
      specs: { Tipo: 'Surfcasting', Longitud: '4,20 m · 3 tramos', 'Acción de lance': '100 – 200 g', Acción: 'Progresiva', Material: 'Carbono · puntera híbrida', 'Línea recomendada': 'Mono 0,25 – 0,30 mm', 'Peso de la caña': '420 g' },
      when: { Condiciones: 'Playa abierta', 'Tipo de agua': 'Cualquiera', Profundidad: 'Fondo', Recuperación: 'A fondo', Escenario: 'Playas y desembocaduras' },
      techniques: ['surfcasting'], species: ['dorada', 'lubina'],
      conditions: ['playa', 'estuario', 'oleaje'],
      related: ['longshore-8000', 'mono-030', 'bajo-conico', 'anzuelo-chinu-2'],
      art: { k: 'rod', c: ['#30363a', '#6f7f78'], long: true }, listings: { wallapop: '' }
    }),
    P({
      id: 'deep-662mh', name: 'Deep 662MH', waterTypes: [SW], category: 'canas', sub: 'embarcacion', type: 'Caña de embarcación',
      length: '1,98 m', weightRange: [20, 80],
      summary: 'Corta y potente para pescar en vertical.',
      description: 'Caña de embarcación para jigging ligero y spinning desde barco o kayak. Corta para maniobrar y con potencia para levantar peces del fondo.',
      specs: { Tipo: 'Embarcación', Longitud: '1,98 m · 1 tramo', 'Acción de lance': '20 – 80 g', Acción: 'Rápida', Material: 'Carbono · anillas SiC', 'Línea recomendada': 'PE 1.0 – 1.5', 'Peso de la caña': '150 g' },
      when: { Condiciones: 'Deriva, corriente', 'Tipo de agua': 'Cualquiera', Profundidad: '10 – 60 m', Recuperación: 'Vertical', Escenario: 'Bajos y veriles' },
      techniques: ['embarcacion'], species: ['depredadores', 'anjova', 'jurel', 'dorada', 'calamar'],
      conditions: ['embarcacion', 'profundidad'],
      related: ['arc-3000', 'slow-jig-60', 'pe-x8-08'],
      art: { k: 'rod', c: ['#1f2a33', '#556a7b'] }, listings: { wallapop: '', vinted: '' }
    }),

    // ——— CARRETES
    P({
      id: 'arc-3000', name: 'Arc 3000', waterTypes: [FW, SW], category: 'carretes', sub: 'spinning', type: 'Carrete de spinning',
      length: 'Tamaño 3000', weight: null, featured: true,
      summary: 'Freno progresivo y protección frente a la sal.',
      description: 'Carrete de spinning con cuerpo rígido, freno de carbono y sellado frente a la sal. Recuperación fluida para trabajar señuelos durante horas.',
      specs: { Tipo: 'Spinning', Tamaño: '3000', Ratio: '6,2:1', Freno: '9 kg · carbono', Material: 'Cuerpo de aluminio', Capacidad: 'PE 1.0 · 200 m', Peso: '245 g' },
      when: { Condiciones: 'Costa y embarcación', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: 'Fluida', Escenario: 'Spinning costero' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion'],
      related: ['ridge-902m', 'pe-x8-08', 'fluoro-025'],
      art: { k: 'reel', c: ['#2d3134', '#9aa3a8'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'arc-2500s', name: 'Arc 2500S', waterTypes: [FW, SW], category: 'carretes', sub: 'eging', type: 'Carrete bobina baja',
      length: 'Tamaño 2500', weight: null,
      summary: 'Bobina baja para líneas finas.',
      description: 'Carrete ligero con bobina baja para trenzados finos. Pensado para eging y light spinning, donde cada gramo cuenta.',
      specs: { Tipo: 'Spinning · bobina baja', Tamaño: '2500', Ratio: '5,8:1', Freno: '5 kg', Material: 'Cuerpo de composite', Capacidad: 'PE 0.6 · 150 m', Peso: '190 g' },
      when: { Condiciones: 'Aguas abrigadas', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: 'Fina', Escenario: 'Puertos y escolleras' },
      techniques: ['eging', 'light-spinning'], species: ['calamar', 'cefalopodos', 'jurel'],
      conditions: ['puerto', 'espigon'],
      related: ['tide-egi-862m', 'drift-762l', 'pe-x8-08'],
      art: { k: 'reel', c: ['#3a3f3a', '#b6a27a'] }, listings: { vinted: '' }
    }),
    P({
      id: 'arc-1000', name: 'Arc 1000', waterTypes: [FW, SW], category: 'carretes', sub: 'spinning', type: 'Carrete ultraligero',
      length: 'Tamaño 1000', weight: null,
      summary: 'El compañero del rockfishing.',
      description: 'Carrete compacto para equipos ultraligeros. Freno fino para trabajar líneas de PE 0.2 con seguridad.',
      specs: { Tipo: 'Spinning ultraligero', Tamaño: '1000', Ratio: '5,2:1', Freno: '3 kg', Material: 'Composite', Capacidad: 'PE 0.3 · 150 m', Peso: '170 g' },
      when: { Condiciones: 'Pesca fina', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: 'Fina', Escenario: 'Escolleras' },
      techniques: ['rockfishing', 'light-spinning'], species: ['depredadores', 'jurel'],
      conditions: ['costa-rocosa', 'puerto', 'espigon'],
      related: ['rockline-742ul', 'pe-x4-03'],
      art: { k: 'reel', c: ['#2c3236', '#7d8a8f'], small: true }, listings: { wallapop: '' }
    }),
    P({
      id: 'longshore-8000', name: 'Longshore 8000', waterTypes: [SW], category: 'carretes', sub: 'surfcasting', type: 'Carrete de surfcasting',
      length: 'Tamaño 8000', weight: null,
      summary: 'Bobina larga para lances de distancia.',
      description: 'Carrete de surfcasting con bobina cónica larga que reduce el rozamiento de la línea en el lance y gana metros en cada salida.',
      specs: { Tipo: 'Surfcasting', Tamaño: '8000', Ratio: '4,6:1', Freno: '12 kg', Material: 'Aluminio', Capacidad: 'Mono 0,30 · 300 m', Peso: '520 g' },
      when: { Condiciones: 'Playa abierta', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: 'Potente', Escenario: 'Playas' },
      techniques: ['surfcasting'], species: ['dorada', 'lubina'],
      conditions: ['playa', 'estuario'],
      related: ['shore-4203', 'mono-030', 'bajo-conico'],
      art: { k: 'reel', c: ['#2f3538', '#c2c8c9'], large: true }, listings: { wallapop: '', vinted: '' }
    }),

    // ——— LÍNEAS
    P({
      id: 'pe-x8-08', name: 'Braid X8 PE 0.8', waterTypes: [FW, SW], category: 'lineas', sub: 'trenzado', type: 'Trenzado 8 hilos',
      length: '150 m', weight: null, featured: true,
      summary: 'Redondo, suave y sin memoria.',
      description: 'Trenzado de 8 hilos con tratamiento de superficie para lances largos y silenciosos. Sección redonda que se asienta bien en la bobina.',
      specs: { Tipo: 'Trenzado · 8 hilos', Diámetro: '0,15 mm', Resistencia: '7,2 kg', Longitud: '150 m', Material: 'PE', Color: 'Gris piedra' },
      when: { Condiciones: 'Lances largos', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: '—', Escenario: 'Spinning, eging y embarcación' },
      techniques: ['spinning', 'eging', 'embarcacion', 'light-spinning'], species: ['lubina', 'anjova', 'calamar', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'puerto', 'embarcacion'],
      related: ['fluoro-025', 'arc-3000', 'ridge-902m'],
      art: { k: 'spool', c: ['#8b8c86', '#2b2e30'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'pe-x4-03', name: 'Braid X4 PE 0.3', waterTypes: [FW, SW], category: 'lineas', sub: 'trenzado', type: 'Trenzado 4 hilos',
      length: '150 m', weight: null,
      summary: 'Finura para equipos ultraligeros.',
      description: 'Trenzado fino de 4 hilos para rockfishing y light spinning. Máxima sensibilidad y lance con señuelos de muy pocos gramos.',
      specs: { Tipo: 'Trenzado · 4 hilos', Diámetro: '0,09 mm', Resistencia: '3 kg', Longitud: '150 m', Material: 'PE', Color: 'Verde oliva' },
      when: { Condiciones: 'Pesca fina', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: '—', Escenario: 'Puertos y escolleras' },
      techniques: ['rockfishing', 'light-spinning'], species: ['jurel', 'depredadores'],
      conditions: ['costa-rocosa', 'puerto', 'espigon'],
      related: ['fluoro-025', 'arc-1000', 'rockline-742ul'],
      art: { k: 'spool', c: ['#5a6146', '#2b2e30'] }, listings: { vinted: '' }
    }),
    P({
      id: 'fluoro-025', name: 'Fluorocarbono 0,25', waterTypes: [FW, SW], category: 'lineas', sub: 'fluorocarbono', type: 'Fluorocarbono 100%',
      length: '50 m', weight: null, featured: true,
      summary: 'Invisible bajo el agua, duro contra la roca.',
      description: 'Fluorocarbono 100% para bajos. Índice de refracción próximo al del agua y alta resistencia a la abrasión en costa rocosa.',
      specs: { Tipo: 'Fluorocarbono 100%', Diámetro: '0,25 mm', Resistencia: '4,8 kg', Longitud: '50 m', Material: 'PVDF', Color: 'Transparente' },
      when: { Condiciones: 'Agua clara', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: '—', Escenario: 'Bajo para spinning, LRF y eging' },
      techniques: ['spinning', 'light-spinning', 'rockfishing', 'eging'], species: ['lubina', 'jurel', 'calamar', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'puerto', 'espigon', 'playa'],
      related: ['pe-x8-08', 'grapa-rapida-1', 'paddle-tail-90'],
      art: { k: 'spool', c: ['#c9d7de', '#5d7282'], clear: true }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'mono-030', name: 'Mono 0,30', waterTypes: [FW, SW], category: 'lineas', sub: 'monofilamento', type: 'Monofilamento',
      length: '300 m', weight: null,
      summary: 'Elasticidad y resistencia para pescar a fondo.',
      description: 'Monofilamento de baja memoria para surfcasting y pesca a fondo desde embarcación. Elasticidad que perdona los tirones de peces potentes.',
      specs: { Tipo: 'Monofilamento', Diámetro: '0,30 mm', Resistencia: '7 kg', Longitud: '300 m', Material: 'Nylon copolímero', Color: 'Arena' },
      when: { Condiciones: 'Pesca a fondo', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: '—', Escenario: 'Playa y embarcación' },
      techniques: ['surfcasting', 'embarcacion'], species: ['dorada', 'lubina', 'cefalopodos'],
      conditions: ['playa', 'estuario', 'embarcacion'],
      related: ['bajo-conico', 'longshore-8000', 'anzuelo-chinu-2'],
      art: { k: 'spool', c: ['#cdb993', '#6f5a3c'] }, listings: { wallapop: '' }
    }),
    P({
      id: 'bajo-conico', name: 'Puente cónico 0,26–0,57', waterTypes: [SW], category: 'lineas', sub: 'bajos', type: 'Bajo cónico',
      length: '5 × 15 m', weight: null,
      summary: 'Protege la línea en el momento del lance.',
      description: 'Puentes cónicos que absorben la carga del lance en surfcasting. Transición progresiva de diámetro para que el nudo pase suave por las anillas.',
      specs: { Tipo: 'Bajo cónico', Diámetro: '0,26 → 0,57 mm', Resistencia: '5 → 20 kg', Longitud: '5 × 15 m', Material: 'Nylon', Color: 'Rojo' },
      when: { Condiciones: 'Lances potentes', 'Tipo de agua': 'Salada', Profundidad: '—', Recuperación: '—', Escenario: 'Playa' },
      techniques: ['surfcasting'], species: ['dorada', 'lubina'],
      conditions: ['playa'],
      related: ['mono-030', 'shore-4203', 'giratorio-rolling'],
      art: { k: 'spool', c: ['#b4533f', '#2b2e30'], small: true }, listings: { vinted: '' }
    }),

    // ——— ACCESORIOS
    P({
      id: 'jig-head-3', name: 'Jig Head 3 g', waterTypes: [FW, SW], category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
      length: 'Anzuelo nº 6', weight: 3,
      summary: 'Para micro vinilos y rockfishing.',
      description: 'Cabeza plomada redonda con anzuelo fino y afilado. Caída lenta y natural para micro vinilos.',
      specs: { Tipo: 'Cabeza redonda', Peso: '3 g', Anzuelo: 'nº 6', Material: 'Plomo · acero al carbono', Color: 'Natural' },
      techniques: ['rockfishing', 'light-spinning'], species: ['jurel', 'depredadores'],
      conditions: ['costa-rocosa', 'puerto', 'espigon'],
      related: ['pin-tail-55', 'pe-x4-03'],
      art: { k: 'jighead', c: ['#6c6e70', '#b9bcbc'], small: true }, listings: { vinted: '' }
    }),
    P({
      id: 'jig-head-7', name: 'Jig Head 7 g', waterTypes: [FW, SW], category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
      length: 'Anzuelo 1/0', weight: 7,
      summary: 'Versátil para light spinning.',
      description: 'Cabeza plomada con quilla estabilizadora para vinilos de 50 a 90 mm.',
      specs: { Tipo: 'Cabeza con quilla', Peso: '7 g', Anzuelo: '1/0', Material: 'Plomo · acero al carbono', Color: 'Plata' },
      techniques: ['light-spinning', 'spinning', 'rockfishing'], species: ['lubina', 'jurel', 'depredadores'],
      conditions: ['puerto', 'espigon', 'costa-rocosa'],
      related: ['paddle-tail-90', 'pin-tail-55', 'fluoro-025'],
      art: { k: 'jighead', c: ['#7b8084', '#d0d4d4'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'jig-head-10', name: 'Jig Head 10 g', waterTypes: [FW, SW], category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
      length: 'Anzuelo 2/0', weight: 10, featured: true,
      summary: 'La cabeza de referencia para el Paddle Tail 90.',
      description: 'Cabeza plomada con anzuelo 2/0 y retenedor de vinilo. Equilibrio perfecto para vinilos de 80 a 100 mm en spinning costero.',
      specs: { Tipo: 'Cabeza con retenedor', Peso: '10 g', Anzuelo: '2/0', Material: 'Plomo · acero al carbono', Color: 'Plata' },
      techniques: ['spinning', 'light-spinning'], species: ['lubina', 'anjova', 'jurel', 'depredadores'],
      conditions: ['costa-rocosa', 'espigon', 'puerto', 'estuario'],
      related: ['paddle-tail-90', 'fluoro-025', 'grapa-rapida-1'],
      art: { k: 'jighead', c: ['#6f7478', '#c7cbcc'], large: true }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'jig-head-21', name: 'Jig Head 21 g', waterTypes: [FW, SW], category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
      length: 'Anzuelo 4/0', weight: 21,
      summary: 'Para vinilos grandes y mar movido.',
      description: 'Cabeza pesada para shads de 110 a 140 mm. Mantiene el vinilo en su capa con corriente y oleaje.',
      specs: { Tipo: 'Cabeza pez', Peso: '21 g', Anzuelo: '4/0', Material: 'Plomo · acero al carbono', Color: 'Plata' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion', 'oleaje'],
      related: ['slim-shad-120', 'fluoro-025'],
      art: { k: 'jighead', c: ['#62676b', '#b4b9ba'], large: true }, listings: { wallapop: '' }
    }),
    P({
      id: 'grapa-rapida-1', name: 'Grapa rápida nº 1', waterTypes: [FW, SW], category: 'accesorios', sub: 'grapas', type: 'Grapa',
      length: 'nº 1 · 10 uds', weight: null, featured: true,
      summary: 'Cambia de señuelo en segundos.',
      description: 'Grapa de acero inoxidable de apertura rápida. Permite cambiar de señuelo sin rehacer el nudo y respeta su nado natural.',
      specs: { Tipo: 'Grapa rápida', Talla: 'nº 1', Resistencia: '15 kg', Material: 'Acero inoxidable', Unidades: '10' },
      techniques: ['spinning', 'light-spinning', 'eging', 'embarcacion'], species: ['lubina', 'anjova', 'jurel', 'calamar', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'puerto', 'espigon', 'embarcacion'],
      related: ['fluoro-025', 'giratorio-rolling', 'caja-organizadora'],
      art: { k: 'snap', c: ['#a9b0b4', '#4a5054'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'giratorio-rolling', name: 'Giratorio rolling nº 8', waterTypes: [FW, SW], category: 'accesorios', sub: 'giratorios', type: 'Giratorio',
      length: 'nº 8 · 10 uds', weight: null,
      summary: 'Evita que la línea se retuerza.',
      description: 'Giratorio de rodamiento compacto que elimina torsiones en la línea al trabajar jigs y montajes a fondo.',
      specs: { Tipo: 'Rolling swivel', Talla: 'nº 8', Resistencia: '18 kg', Material: 'Latón niquelado', Unidades: '10' },
      techniques: ['surfcasting', 'embarcacion', 'spinning'], species: ['dorada', 'anjova', 'depredadores', 'cefalopodos'],
      conditions: ['playa', 'embarcacion'],
      related: ['grapa-rapida-1', 'mono-030', 'bajo-conico'],
      art: { k: 'swivel', c: ['#8c9296', '#3c4246'] }, listings: { wallapop: '' }
    }),
    P({
      id: 'anzuelo-chinu-2', name: 'Anzuelo Chinu nº 2', waterTypes: [SW], category: 'accesorios', sub: 'anzuelos', type: 'Anzuelo',
      length: 'nº 2 · 10 uds', weight: null,
      summary: 'Curva clásica para espáridos.',
      description: 'Anzuelo de pata corta y curva chinu para doradas y otros espáridos. Afilado químico y alambre resistente.',
      specs: { Tipo: 'Chinu', Talla: 'nº 2', Material: 'Acero al carbono', Acabado: 'Negro niquelado', Unidades: '10' },
      techniques: ['surfcasting', 'embarcacion'], species: ['dorada'],
      conditions: ['playa', 'embarcacion', 'estuario'],
      related: ['mono-030', 'bajo-conico', 'giratorio-rolling'],
      art: { k: 'hook', c: ['#2c2f31', '#6c7276'] }, listings: { vinted: '' }
    }),
    P({
      id: 'caja-organizadora', name: 'Caja organizadora 3600', waterTypes: [FW, SW], category: 'accesorios', sub: 'cajas', type: 'Caja de señuelos',
      length: '36 × 22 × 5 cm', weight: null,
      summary: 'Todo en su sitio, todo a mano.',
      description: 'Caja estanca con separadores ajustables para minnows, vinilos y accesorios. Cierres firmes y junta de goma.',
      specs: { Tipo: 'Caja estanca', Medidas: '36 × 22 × 5 cm', Compartimentos: 'Hasta 18', Material: 'Polipropileno', Color: 'Transparente / grafito' },
      techniques: ['spinning', 'light-spinning', 'rockfishing', 'eging'], species: [],
      conditions: [],
      related: ['bolsa-tide', 'mochila-coastline', 'grapa-rapida-1'],
      art: { k: 'box', c: ['#d8dcd6', '#3a3f3c'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'alicates-alu', name: 'Alicates de aluminio', waterTypes: [FW, SW], category: 'accesorios', sub: 'herramientas', type: 'Alicates',
      length: '17 cm', weight: null,
      summary: 'Desanzuelar, cortar y abrir anillas.',
      description: 'Alicates de aluminio anodizado con cortador de trenzado, punta para anillas y cordón de seguridad.',
      specs: { Tipo: 'Alicates multifunción', Longitud: '17 cm', Material: 'Aluminio · acero inox', Incluye: 'Funda y cordón', Color: 'Verde bosque' },
      techniques: ['spinning', 'light-spinning', 'rockfishing', 'embarcacion', 'surfcasting'], species: [],
      conditions: [],
      related: ['caja-organizadora', 'mochila-coastline'],
      art: { k: 'pliers', c: ['#34473a', '#b9bdb8'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'mochila-coastline', name: 'Mochila Coastline 22 L', waterTypes: [FW, SW], category: 'accesorios', sub: 'mochilas', type: 'Mochila',
      length: '22 L', weight: null, featured: true,
      summary: 'Ligera para recorrer la costa.',
      description: 'Mochila de 22 L con tejido resistente al agua, porta cañas lateral y espalda ventilada. Pensada para caminar entre rocas con las manos libres.',
      specs: { Tipo: 'Mochila', Capacidad: '22 L', Material: 'Nylon 420D recubierto', Incluye: 'Porta cañas · bolsillo para cajas', Color: 'Verde oliva' },
      techniques: ['spinning', 'rockfishing', 'light-spinning', 'eging'], species: [],
      conditions: ['costa-rocosa'],
      related: ['caja-organizadora', 'bolsa-tide', 'alicates-alu'],
      art: { k: 'backpack', c: ['#4b5236', '#2b2e30'] }, listings: { wallapop: '', vinted: '' }
    }),
    P({
      id: 'bolsa-tide', name: 'Bolsa Tide 8 L', waterTypes: [FW, SW], category: 'accesorios', sub: 'bolsas', type: 'Bolsa de hombro',
      length: '8 L', weight: null,
      summary: 'Lo esencial, al alcance de la mano.',
      description: 'Bolsa de hombro con fondo rígido para dos cajas medianas, porta alicates y bolsillo estanco para el móvil.',
      specs: { Tipo: 'Bolsa de hombro', Capacidad: '8 L', Material: 'Poliéster 600D', Incluye: 'Porta alicates', Color: 'Beige' },
      techniques: ['spinning', 'light-spinning', 'eging', 'rockfishing'], species: [],
      conditions: [],
      related: ['caja-organizadora', 'alicates-alu'],
      art: { k: 'bag', c: ['#bba98a', '#3a3f3c'] }, listings: { vinted: '' }
    }),
    P({
      id: 'gafas-polarizadas', name: 'Gafas polarizadas Shoreline', waterTypes: [FW, SW], category: 'accesorios', sub: 'complementos', type: 'Gafas polarizadas',
      length: 'Lente gris', weight: null,
      summary: 'Ver bajo la superficie.',
      description: 'Gafas con lentes polarizadas que eliminan reflejos para leer el fondo, ver peces y proteger los ojos durante el lance.',
      specs: { Tipo: 'Gafas polarizadas', Lente: 'Gris · categoría 3', Montura: 'TR90', Incluye: 'Funda y cordón flotante', Color: 'Grafito' },
      techniques: ['spinning', 'rockfishing', 'light-spinning', 'embarcacion'], species: [],
      conditions: [],
      related: ['mochila-coastline', 'alicates-alu'],
      art: { k: 'glasses', c: ['#2b2e30', '#4f6a74'] }, listings: { wallapop: '', vinted: '' }
    }),

    // ——— AGUA DULCE · DATOS DE EJEMPLO (`sample: true`): sustituir por el catálogo real.
    P({
      id: 'cucharilla-2', name: 'Cucharilla Spin 2', waterTypes: [FW], sample: true, category: 'senuelos', sub: 'cucharillas', type: 'Cucharilla giratoria',
      length: 'Nº 2', weight: 4,
      summary: 'El clásico que nunca falla en el río.',
      description: 'Cucharilla giratoria con paleta que vibra desde la recuperación más lenta. Atrae a truchas y black bass por destello y vibración.',
      specs: { Tipo: 'Cucharilla giratoria', Talla: 'Nº 2', Peso: '4 g', Acción: 'Rotación de paleta', Material: 'Latón · triple inox', Color: 'Plata' },
      when: { Condiciones: 'Agua clara o algo tomada', 'Tipo de agua': 'Dulce', Profundidad: 'Media agua', Recuperación: 'Lineal, lenta', Escenario: 'Ríos, arroyos y embalses' },
      techniques: ['spinning', 'light-spinning'], species: ['trucha', 'black-bass'],
      conditions: ['rio', 'arroyo', 'embalse', 'lago', 'corriente'],
      related: ['fluoro-025', 'grapa-rapida-1', 'stream-602ul'],
      art: { k: 'spoon', c: ['#c9cdd0', '#6c7276'] }
    }),
    P({
      id: 'jerk-110sp', name: 'Jerkbait 110SP', waterTypes: [FW], sample: true, category: 'senuelos', sub: 'minnows', type: 'Jerkbait suspending',
      length: '110 mm', weight: 15,
      summary: 'Pausas largas que provocan ataques.',
      description: 'Jerkbait de flotabilidad neutra que queda suspendido en las pausas. Tirones de puntera y paradas para lucios y black bass.',
      specs: { Tipo: 'Jerkbait suspending', Longitud: '110 mm', Peso: '15 g', Acción: 'Darting', Material: 'ABS', Color: 'Perca', Profundidad: '1 – 1,8 m' },
      when: { Condiciones: 'Agua fría o peces apáticos', 'Tipo de agua': 'Dulce', Profundidad: 'Media agua', Recuperación: 'Tirones y pausas', Escenario: 'Embalses y lagos' },
      techniques: ['spinning'], species: ['lucio', 'black-bass'],
      conditions: ['embalse', 'lago', 'rio'],
      related: ['bajo-acero-30', 'grapa-rapida-1', 'lakeside-702m'],
      art: { k: 'minnow', c: ['#4f6b2f', '#e9e2c4'], stripes: true }
    }),
    P({
      id: 'texas-craw-75', name: 'Craw 75', waterTypes: [FW], sample: true, category: 'senuelos', sub: 'vinilos', type: 'Vinilo cangrejo',
      length: '75 mm', weight: 7,
      summary: 'Imitación de cangrejo para el fondo.',
      description: 'Vinilo con forma de cangrejo para montar en texas o con cabeza plomada y arrastrar por el fondo entre piedras y troncos.',
      specs: { Tipo: 'Vinilo · cangrejo', Longitud: '75 mm', Peso: '7 g (montado)', Acción: 'Pinzas con movimiento', Material: 'Compuesto TPR', Color: 'Verde calabaza' },
      when: { Condiciones: 'Peces pegados al fondo', 'Tipo de agua': 'Dulce', Profundidad: 'Fondo', Recuperación: 'Arrastre y saltos', Escenario: 'Embalses con piedra y estructura' },
      techniques: ['spinning'], species: ['black-bass'],
      conditions: ['embalse', 'lago'],
      related: ['fluoro-025', 'lakeside-702m'],
      art: { k: 'pintail', c: ['#5b5a2e', '#a49a5c'] }
    }),
    P({
      id: 'ninfa-pheasant-14', name: 'Ninfa Pheasant Tail nº 14', waterTypes: [FW], sample: true, category: 'senuelos', sub: 'moscas', type: 'Ninfa',
      length: 'Nº 14', weight: null,
      summary: 'La ninfa imprescindible en la caja.',
      description: 'Imitación de larva de efémera lastrada para pescar cerca del fondo en corrientes y pozas.',
      specs: { Tipo: 'Ninfa lastrada', Talla: 'Anzuelo nº 14', Material: 'Faisán · cobre', Color: 'Natural' },
      when: { Condiciones: 'Sin actividad en superficie', 'Tipo de agua': 'Dulce', Profundidad: 'Fondo', Recuperación: 'Deriva natural', Escenario: 'Ríos y arroyos' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'corriente'],
      related: ['bajo-conico-9ft-5x', 'wf5f'],
      art: { k: 'fly', c: ['#8a5a2b', '#c08a4a'] }
    }),
    P({
      id: 'seca-adams-16', name: 'Mosca seca Adams nº 16', waterTypes: [FW], sample: true, category: 'senuelos', sub: 'moscas', type: 'Mosca seca',
      length: 'Nº 16', weight: null,
      summary: 'Para las cebadas en superficie.',
      description: 'Seca polivalente que imita a muchos insectos adultos. Flota alta y se ve bien en la corriente.',
      specs: { Tipo: 'Mosca seca', Talla: 'Anzuelo nº 16', Material: 'Pelo · gallo', Color: 'Gris' },
      when: { Condiciones: 'Eclosiones y cebadas', 'Tipo de agua': 'Dulce', Profundidad: 'Superficie', Recuperación: 'Deriva natural', Escenario: 'Ríos, arroyos y lagos' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'lago', 'aguas-calmas'],
      related: ['bajo-conico-9ft-5x', 'wf5f'],
      art: { k: 'fly', c: ['#6b6e70', '#b9a37c'], dry: true }
    }),
    P({
      id: 'brook-905-5', name: 'Brook 905 #5', waterTypes: [FW], sample: true, category: 'canas', sub: 'mosca', type: 'Caña de mosca',
      length: '2,74 m', weightRange: null,
      summary: 'La caña de mosca polivalente para río.',
      description: 'Caña de cuatro tramos para línea #5. Acción media-rápida para lanzar con precisión secas y ninfas en ríos y lagos.',
      specs: { Tipo: 'Mosca', Longitud: '2,74 m (9 ft) · 4 tramos', Línea: '#5', Acción: 'Media-rápida', Material: 'Carbono' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'lago'],
      related: ['brook-fly-56', 'wf5f', 'bajo-conico-9ft-5x'],
      art: { k: 'rod', c: ['#2f3a31', '#b89a6a'] }
    }),
    P({
      id: 'stream-602ul', name: 'Stream 602UL', waterTypes: [FW], sample: true, category: 'canas', sub: 'light-spinning', type: 'Caña de spinning ligero',
      length: '1,83 m', weightRange: [2, 8],
      summary: 'Corta y precisa para ríos estrechos.',
      description: 'Caña ultraligera para lanzar cucharillas y pequeños vinilos bajo la vegetación de ríos y arroyos.',
      specs: { Tipo: 'Spinning ultraligero', Longitud: '1,83 m · 2 tramos', 'Acción de lance': '2 – 8 g', Acción: 'Rápida', Material: 'Carbono', 'Línea recomendada': 'PE 0.3 – 0.6' },
      techniques: ['spinning', 'light-spinning'], species: ['trucha'],
      conditions: ['rio', 'arroyo'],
      related: ['cucharilla-2', 'arc-1000', 'pe-x4-03'],
      art: { k: 'rod', c: ['#2c3433', '#9c8763'] }
    }),
    P({
      id: 'lakeside-702m', name: 'Lakeside 702M', waterTypes: [FW], sample: true, category: 'canas', sub: 'spinning', type: 'Caña de spinning',
      length: '2,13 m', weightRange: [7, 28],
      summary: 'Para embalses: potencia y control.',
      description: 'Caña de spinning de agua dulce para jerkbaits, vinilos y señuelos de superficie. Reserva para sacar al pez de la estructura.',
      specs: { Tipo: 'Spinning', Longitud: '2,13 m · 2 tramos', 'Acción de lance': '7 – 28 g', Acción: 'Rápida', Material: 'Carbono', 'Línea recomendada': 'PE 0.8 – 1.2' },
      techniques: ['spinning'], species: ['black-bass', 'lucio'],
      conditions: ['embalse', 'lago', 'rio'],
      related: ['arc-3000', 'jerk-110sp', 'texas-craw-75'],
      art: { k: 'rod', c: ['#263036', '#6f7a63'] }
    }),
    P({
      id: 'carp-12-3lb', name: 'Carp 12 3 lb', waterTypes: [FW], sample: true, category: 'canas', sub: 'carpfishing', type: 'Caña de carpfishing',
      length: '3,66 m', weightRange: null,
      summary: 'Lances largos y control en el combate.',
      description: 'Caña de carpfishing de 12 pies y 3 libras. Lanza montajes y plomos a distancia y absorbe las arrancadas de peces grandes.',
      specs: { Tipo: 'Carpfishing', Longitud: '3,66 m (12 ft) · 2 tramos', Potencia: '3 lb', Acción: 'Progresiva', Material: 'Carbono' },
      techniques: ['carpfishing'], species: ['carpa', 'barbo'],
      conditions: ['lago', 'embalse', 'rio'],
      related: ['bigpit-10000', 'mono-carp-035', 'hair-rig-6'],
      art: { k: 'rod', c: ['#1f2724', '#3e4a40'], long: true }
    }),
    P({
      id: 'brook-fly-56', name: 'Brook Fly 5/6', waterTypes: [FW], sample: true, category: 'carretes', sub: 'mosca', type: 'Carrete de mosca',
      length: 'Línea #5 – #6', weight: null,
      summary: 'Ligero, de gran arbor.',
      description: 'Carrete de mosca de aluminio con gran diámetro de bobina para recoger rápido y freno de disco suave.',
      specs: { Tipo: 'Mosca', Línea: '#5 – #6', Freno: 'Disco', Material: 'Aluminio', Capacidad: 'WF5 + 75 m backing' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'lago'],
      related: ['brook-905-5', 'wf5f'],
      art: { k: 'flyreel', c: ['#2d3134', '#9aa3a8'] }
    }),
    P({
      id: 'bigpit-10000', name: 'Big Pit 10000', waterTypes: [FW], sample: true, category: 'carretes', sub: 'carpfishing', type: 'Carrete big pit',
      length: 'Tamaño 10000', weight: null,
      summary: 'Bobina grande para lances largos.',
      description: 'Carrete de carpfishing con bobina cónica de gran capacidad y freno de combate para trabajar peces grandes.',
      specs: { Tipo: 'Big pit', Tamaño: '10000', Ratio: '4,6:1', Freno: 'Freno de combate', Capacidad: 'Mono 0,35 · 350 m' },
      techniques: ['carpfishing'], species: ['carpa', 'barbo'],
      conditions: ['lago', 'embalse', 'rio'],
      related: ['carp-12-3lb', 'mono-carp-035'],
      art: { k: 'reel', c: ['#2a2f2c', '#8c948f'], large: true }
    }),
    P({
      id: 'wf5f', name: 'Línea de mosca WF5F', waterTypes: [FW], sample: true, category: 'lineas', sub: 'linea-mosca', type: 'Línea de mosca flotante',
      length: '27 m', weight: null,
      summary: 'Flotante y fácil de lanzar.',
      description: 'Línea de mosca de perfil weight forward flotante para lanzar con facilidad secas y ninfas.',
      specs: { Tipo: 'Weight forward flotante', Número: '#5', Longitud: '27 m', Color: 'Oliva' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'lago'],
      related: ['bajo-conico-9ft-5x', 'brook-fly-56'],
      art: { k: 'spool', c: ['#7d8a52', '#2b2e30'] }
    }),
    P({
      id: 'bajo-conico-9ft-5x', name: 'Bajo cónico 9 ft 5X', waterTypes: [FW], sample: true, category: 'lineas', sub: 'bajos', type: 'Bajo cónico de mosca',
      length: '2,74 m', weight: null,
      summary: 'Presentaciones finas y naturales.',
      description: 'Bajo cónico para pesca a mosca que transmite la energía del lance y posa la mosca con suavidad.',
      specs: { Tipo: 'Bajo cónico', Longitud: '9 ft', Punta: '5X · 0,15 mm', Material: 'Nylon' },
      techniques: ['fly-fishing'], species: ['trucha'],
      conditions: ['rio', 'arroyo', 'lago'],
      related: ['wf5f', 'ninfa-pheasant-14'],
      art: { k: 'spool', c: ['#cfd6d2', '#2b2e30'], clear: true, small: true }
    }),
    P({
      id: 'bajo-acero-30', name: 'Bajo de acero 30 cm', waterTypes: [FW], sample: true, category: 'lineas', sub: 'bajos', type: 'Bajo de acero',
      length: '30 cm · 2 uds', weight: null,
      summary: 'Imprescindible para el lucio.',
      description: 'Bajo de acero trenzado con grapa y giratorio para evitar que los dientes del lucio corten la línea.',
      specs: { Tipo: 'Acero trenzado', Longitud: '30 cm', Resistencia: '15 kg', Unidades: '2' },
      techniques: ['spinning'], species: ['lucio'],
      conditions: [],
      related: ['jerk-110sp', 'lakeside-702m'],
      art: { k: 'snap', c: ['#8a9196', '#3c4246'] }
    }),
    P({
      id: 'mono-carp-035', name: 'Mono Carp 0,35', waterTypes: [FW], sample: true, category: 'lineas', sub: 'monofilamento', type: 'Monofilamento carpfishing',
      length: '1000 m', weight: null,
      summary: 'Resistente a la abrasión y discreto.',
      description: 'Monofilamento de baja memoria y color camuflaje para carpfishing a media y larga distancia.',
      specs: { Tipo: 'Monofilamento', Diámetro: '0,35 mm', Resistencia: '9 kg', Longitud: '1000 m', Color: 'Camo verde' },
      techniques: ['carpfishing'], species: ['carpa', 'barbo'],
      conditions: ['lago', 'embalse', 'rio'],
      related: ['bigpit-10000', 'hair-rig-6'],
      art: { k: 'spool', c: ['#55603f', '#2b2e30'] }
    }),
    P({
      id: 'hair-rig-6', name: 'Montaje de pelo nº 6', waterTypes: [FW], sample: true, category: 'accesorios', sub: 'anzuelos', type: 'Montaje de pelo',
      length: 'nº 6 · 3 uds', weight: null,
      summary: 'El montaje clásico del carpfishing.',
      description: 'Montajes de pelo atados con terminal trenzado y anzuelo curvo. Listos para cebar con boilie.',
      specs: { Tipo: 'Hair rig', Anzuelo: 'nº 6', Terminal: 'Trenzado 25 lb', Unidades: '3' },
      techniques: ['carpfishing'], species: ['carpa', 'barbo'],
      conditions: ['lago', 'embalse', 'rio'],
      related: ['boilies-20', 'mono-carp-035'],
      art: { k: 'hook', c: ['#2c2f31', '#6c7276'] }
    }),
    P({
      id: 'boilies-20', name: 'Boilies 20 mm', waterTypes: [FW], sample: true, category: 'accesorios', sub: 'cebos', type: 'Boilies',
      length: '1 kg', weight: null,
      summary: 'Cebo duro y selectivo.',
      description: 'Boilies de 20 mm para cebar y montar en el pelo. Tamaño selectivo para carpas grandes.',
      specs: { Tipo: 'Boilies', Diámetro: '20 mm', Peso: '1 kg', Sabor: 'Frutos secos' },
      techniques: ['carpfishing'], species: ['carpa'],
      conditions: ['lago', 'embalse'],
      related: ['hair-rig-6', 'carp-12-3lb'],
      art: { k: 'boilies', c: ['#c99a5b', '#8a5f2f'] }
    })
  ];

  const journal = [
    {
      slug: 'como-elegir-un-vinilo-para-lubina', photo: 'assets/photos/journal-como-elegir-un-vinilo-para-lubina.jpg', title: 'Cómo elegir un vinilo para lubina', cat: 'Guías de pesca', read: 5, scene: 'coast',
      excerpt: 'Tamaño, cola y cabeza plomada: tres decisiones que cambian el nado y el resultado.',
      techniques: ['spinning'], species: ['lubina'], products: ['paddle-tail-90', 'slim-shad-120', 'jig-head-10'],
      body: [
        ['p', 'Un vinilo es probablemente el señuelo más versátil que puedes llevar en la caja. Pero no todos nadan igual, ni sirven para lo mismo. Antes de elegir, piensa en tres cosas: dónde vas a pescar, a qué profundidad está el pez y qué está comiendo.'],
        ['h', '1. El tamaño'],
        ['p', 'Imita al pasto que hay en la zona. Entre 70 y 100 mm cubres la mayoría de situaciones en costa. Los formatos de 120 mm funcionan con mar movido y peces grandes.'],
        ['h', '2. La cola'],
        ['p', 'La cola de pala genera vibración incluso a baja velocidad: es la opción más polivalente. Las colas finas (pin tail) nadan de forma más discreta y funcionan con peces desconfiados.'],
        ['h', '3. La cabeza plomada'],
        ['ul', ['Mar en calma y poca profundidad: 5–10 g.', 'Oleaje moderado o más distancia: 10–20 g.', 'Corriente fuerte o fondo profundo: 20–30 g.']],
        ['p', 'La regla es sencilla: el peso mínimo que te permita mantener el contacto con el señuelo. Cuanto más ligero, más natural será la caída.']
      ]
    },
    {
      slug: 'spinning-desde-costa-equipamiento-basico', photo: 'assets/photos/journal-spinning-desde-costa-equipamiento-basico.webp', title: 'Spinning desde costa: equipamiento básico', cat: 'Equipamiento', read: 6, scene: 'rock',
      excerpt: 'Caña, carrete, línea y cinco señuelos para empezar sin llenar la mochila.',
      techniques: ['spinning'], species: ['lubina', 'anjova'], products: ['ridge-902m', 'arc-3000', 'pe-x8-08', 'fluoro-025', 'minnow-kingdom-105s-plata-holo'],
      body: [
        ['p', 'Empezar en el spinning no requiere un gran equipo, sino un equipo bien equilibrado. Estas son las piezas básicas.'],
        ['h', 'La caña'],
        ['p', 'Entre 2,70 y 3,00 m con una acción de lance de 10–35 g. Suficiente longitud para lanzar lejos y controlar al pez junto a las rocas.'],
        ['h', 'El carrete'],
        ['p', 'Un tamaño 3000–4000 con buen freno. Debe equilibrar la caña: si al sujetarla por el portacarretes la puntera cae, el conjunto cansará.'],
        ['h', 'La línea'],
        ['p', 'Trenzado PE 0.8–1.0 como línea madre y un bajo de fluorocarbono de 0,25–0,30 mm de uno o dos metros.'],
        ['h', 'Los señuelos'],
        ['ul', ['Un minnow flotante para la espuma.', 'Un minnow hundido para distancia.', 'Un paseante para días de calma.', 'Dos vinilos con sus cabezas.', 'Un jig para peces lejanos.']]
      ]
    },
    {
      slug: 'que-gramaje-utilizar-segun-las-condiciones', photo: 'assets/photos/journal-que-gramaje-utilizar-segun-las-condiciones.webp', title: 'Qué gramaje utilizar según las condiciones', cat: 'Consejos', read: 4, scene: 'harbor',
      excerpt: 'Viento, oleaje, corriente y profundidad. Cómo ajustar el peso de tu señuelo.',
      techniques: ['spinning', 'light-spinning'], species: [], products: ['jig-head-7', 'jig-head-10', 'jig-head-21', 'minnow-kingdom-105s-sardina-azul'],
      body: [
        ['p', 'El gramaje correcto es el que te permite llegar a la zona de pesca y mantener el señuelo en la capa de agua donde está el pez. Ni más, ni menos.'],
        ['h', 'Viento'],
        ['p', 'Con viento de cara, un señuelo compacto y más pesado gana distancia. Con viento a favor, puedes bajar gramaje.'],
        ['h', 'Oleaje y corriente'],
        ['p', 'El mar movido y la corriente desplazan el señuelo. Sube el peso lo justo para seguir notando su nado.'],
        ['h', 'Profundidad'],
        ['ul', ['0–2 m: 5–12 g.', '2–5 m: 12–20 g.', 'Más de 5 m o mucha corriente: 20 g o más.']]
      ]
    },
    {
      slug: 'como-elegir-un-fluorocarbono', photo: 'assets/photos/journal-como-elegir-un-fluorocarbono.webp', title: 'Cómo elegir un fluorocarbono', cat: 'Equipamiento', read: 4, scene: 'river',
      excerpt: 'Diámetro, longitud del bajo y nudos. Lo que de verdad importa.',
      techniques: ['spinning', 'light-spinning', 'eging'], species: [], products: ['fluoro-025', 'pe-x8-08'],
      body: [
        ['p', 'El fluorocarbono se usa como bajo por dos razones: es menos visible bajo el agua que el monofilamento y resiste mejor la abrasión contra la roca.'],
        ['h', 'Diámetro'],
        ['ul', ['Light spinning y rockfishing: 0,16–0,22 mm.', 'Spinning costero: 0,25–0,35 mm.', 'Anjova o fondos muy abrasivos: 0,40 mm o más.']],
        ['h', 'Longitud'],
        ['p', 'Entre uno y dos metros es suficiente para la mayoría de situaciones. En aguas muy claras, algo más.'],
        ['h', 'El nudo'],
        ['p', 'Une trenzado y fluorocarbono con un nudo fino que pase por las anillas sin engancharse. Humedece siempre antes de apretar.']
      ]
    },
    {
      slug: 'rockfishing-equipo-basico-para-empezar', photo: 'assets/photos/journal-rockfishing-equipo-basico-para-empezar.webp', title: 'Rockfishing: equipo básico para empezar', cat: 'Técnicas', read: 5, scene: 'rock',
      excerpt: 'Una caña ligera, un carrete pequeño y una caja de micro vinilos.',
      techniques: ['rockfishing'], species: ['depredadores'], products: ['rockline-742ul', 'arc-1000', 'pe-x4-03', 'pin-tail-55', 'jig-head-3'],
      body: [
        ['p', 'El rockfishing es pesca de precisión: pocos gramos, líneas finas y mucha atención a lo que transmite la puntera.'],
        ['h', 'El equipo'],
        ['ul', ['Caña de 1,80–2,30 m con acción de 0,5–10 g.', 'Carrete 1000–2000.', 'Trenzado PE 0.2–0.4 y bajo de 0,18 mm.']],
        ['h', 'Los señuelos'],
        ['p', 'Micro vinilos de 40–60 mm montados en cabezas de 1,5 a 5 g. Algunos micro jigs para peces más activos.'],
        ['h', 'La forma de pescar'],
        ['p', 'Deja caer el señuelo pegado a la roca, recoge la línea sobrante y espera. La picada suele llegar en la caída o en el primer movimiento.']
      ]
    },
    {
      slug: 'eging-primeros-pasos', photo: 'assets/photos/journal-eging-primeros-pasos.webp', title: 'Eging: primeros pasos para pescar calamar', cat: 'Especies', read: 5, scene: 'night',
      excerpt: 'Tirones, caída y paciencia. Todo lo necesario para tu primera noche de eging.',
      techniques: ['eging'], species: ['calamar', 'cefalopodos'], products: ['egi-30-night', 'egi-25-dawn', 'tide-egi-862m', 'arc-2500s'],
      body: [
        ['p', 'El eging es una técnica sencilla de entender y difícil de dominar. La clave está en la caída.'],
        ['h', 'La egi'],
        ['p', 'Una talla 2.5 o 3.0 cubre la mayoría de situaciones desde costa. Colores naturales de día; vivos o luminiscentes de noche.'],
        ['h', 'La animación'],
        ['ul', ['Lanza y deja que la egi llegue cerca del fondo contando los segundos.', 'Dos o tres tirones secos de caña.', 'Recoge la línea sobrante y deja caer con tensión.', 'Observa la línea: cualquier cambio puede ser una picada.']],
        ['h', 'Tras la picada'],
        ['p', 'Mantén la tensión constante y recoge sin prisas. El calamar no está clavado como un pez.']
      ]
    },
    {
      slug: 'salir-al-amanecer-checklist', photo: 'assets/photos/journal-salir-al-amanecer-checklist.webp', title: 'Salir al amanecer: lo que no puede faltar', cat: 'Outdoor', read: 3, scene: 'dawn',
      excerpt: 'Una lista breve para salir ligero y volver con todo.',
      techniques: [], species: [], products: ['mochila-coastline', 'gafas-polarizadas', 'alicates-alu', 'caja-organizadora'],
      body: [
        ['p', 'Las mejores horas suelen ser también las más frías y oscuras. Preparar la mochila la noche anterior es parte de la jornada.'],
        ['ul', ['Frontal con luz roja.', 'Gafas polarizadas.', 'Alicates y cortahilos.', 'Una caja pequeña con los señuelos del día.', 'Capa cortavientos.', 'Agua y algo de comer.', 'Móvil en bolsa estanca.']],
        ['p', 'Y sobre todo: consulta el estado del mar y avisa a alguien de dónde vas a estar. La roca y el oleaje no perdonan descuidos.']
      ]
    }
  ];

  const journalCats = ['Guías de pesca', 'Técnicas', 'Señuelos', 'Especies', 'Equipamiento', 'Consejos', 'Outdoor', 'Experiencias'];

  window.VESCORA = { site, categories, conditions, techniques, species, products, journal, journalCats };
})();
