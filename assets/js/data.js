/*
 * VESCORA — Datos del catálogo.
 *
 * Toda la web se genera a partir de este archivo. Las relaciones
 * PRODUCTO → TÉCNICA → ESPECIE → CONDICIONES viven en cada producto
 * (techniques / species / conditions), de modo que el mismo producto
 * aparece desde el catálogo, desde cada técnica y desde cada especie.
 *
 * Los productos incluidos son DATOS DE EJEMPLO: sustituir por el catálogo real.
 * Campos preparados para una futura fase ecommerce (price, sku, stock) se
 * mantienen a null y la interfaz no los muestra mientras commerce=false.
 */
(function () {
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
        { id: 'jigs', name: 'Jigs' }, { id: 'vibration', name: 'Vibration' }, { id: 'jibioneras', name: 'Jibioneras' }, { id: 'otros', name: 'Otros' }
      ]
    },
    {
      id: 'canas', name: 'Cañas', claim: 'Sensibilidad donde importa. Reserva cuando hace falta.',
      intro: 'Blanks pensados para cada técnica: acción, potencia y longitud equilibradas para lanzar lejos y sentir cada toque.',
      scene: 'coast',
      sub: [
        { id: 'rockfishing', name: 'Rockfishing' }, { id: 'light-spinning', name: 'Light Spinning' }, { id: 'spinning', name: 'Spinning' },
        { id: 'eging', name: 'Eging' }, { id: 'surfcasting', name: 'Surfcasting' }, { id: 'embarcacion', name: 'Embarcación' }
      ]
    },
    {
      id: 'carretes', name: 'Carretes', claim: 'Recuperación fina, freno constante.',
      intro: 'Carretes que acompañan a la caña: recogida suave, freno progresivo y protección frente a la sal.',
      scene: 'harbor',
      sub: [{ id: 'spinning', name: 'Spinning' }, { id: 'surfcasting', name: 'Surfcasting' }, { id: 'eging', name: 'Eging' }]
    },
    {
      id: 'lineas', name: 'Líneas', claim: 'Lo único que te une al pez.',
      intro: 'Trenzados, fluorocarbonos, monofilamentos y bajos elegidos por su resistencia a la abrasión y su comportamiento en el agua.',
      scene: 'river',
      sub: [{ id: 'trenzado', name: 'Trenzado' }, { id: 'fluorocarbono', name: 'Fluorocarbono' }, { id: 'monofilamento', name: 'Monofilamento' }, { id: 'bajos', name: 'Bajos' }]
    },
    {
      id: 'accesorios', name: 'Accesorios', claim: 'Los pequeños detalles marcan la diferencia.',
      intro: 'Anzuelos, grapas, giratorios, cabezas plomadas, cajas, herramientas y equipamiento para moverte ligero.',
      scene: 'forest',
      sub: [
        { id: 'anzuelos', name: 'Anzuelos' }, { id: 'grapas', name: 'Grapas' }, { id: 'giratorios', name: 'Giratorios' },
        { id: 'cabezas-plomadas', name: 'Cabezas plomadas' }, { id: 'cajas', name: 'Cajas' }, { id: 'herramientas', name: 'Herramientas' },
        { id: 'mochilas', name: 'Mochilas' }, { id: 'bolsas', name: 'Bolsas' }, { id: 'complementos', name: 'Complementos' }
      ]
    }
  ];

  // Escenarios y condiciones reutilizables (relación PRODUCTO → CONDICIONES).
  const conditions = [
    { id: 'costa-rocosa', name: 'Costa rocosa', scenario: true },
    { id: 'playa', name: 'Playa', scenario: true },
    { id: 'espigon', name: 'Espigones', scenario: true },
    { id: 'puerto', name: 'Puertos', scenario: true },
    { id: 'estuario', name: 'Estuarios y desembocaduras', scenario: true },
    { id: 'embarcacion', name: 'Embarcación', scenario: true },
    { id: 'oleaje', name: 'Con oleaje' },
    { id: 'aguas-calmas', name: 'Aguas calmas' },
    { id: 'noche', name: 'Noche y baja luz' },
    { id: 'profundidad', name: 'Aguas profundas' }
  ];

  const techniques = [
    {
      id: 'spinning', name: 'Spinning', scene: 'coast',
      claim: 'Una técnica versátil para buscar depredadores en diferentes escenarios.',
      type: 'Pesca activa con señuelos artificiales',
      scenario: 'Costa rocosa, playas, espigones y desembocaduras',
      intro: 'Lanzar, recuperar y volver a lanzar. El spinning consiste en recorrer el agua con señuelos que imitan presas para provocar el ataque de los depredadores. Es la técnica que más terreno cubre y la mejor puerta de entrada a la pesca con artificiales.',
      gear: [['Caña', '2,40 – 3,00 m · 10–40 g'], ['Carrete', 'Tamaño 3000 – 4000'], ['Línea madre', 'Trenzado PE 0.8 – 1.2'], ['Bajo', 'Fluorocarbono 0,25 – 0,35 mm']],
      tips: ['Empieza cubriendo agua con un minnow o un vinilo y ajusta el gramaje a la distancia y al oleaje.', 'Las horas de luz cambiante —amanecer y atardecer— suelen ser las más activas.', 'Varía el ritmo de recuperación antes de cambiar de señuelo.']
    },
    {
      id: 'light-spinning', name: 'Light Spinning', scene: 'harbor',
      claim: 'Equipos ligeros, señuelos pequeños y mucha sensibilidad.',
      type: 'Spinning ligero con señuelos de 3 a 15 g',
      scenario: 'Puertos, espigones, calas y zonas abrigadas',
      intro: 'El light spinning reduce el equipo para disfrutar de cada pez y llegar a especies que no atacan señuelos grandes. Vinilos pequeños, micro jigs y minnows compactos con cañas de acción rápida y líneas finas.',
      gear: [['Caña', '2,10 – 2,40 m · 3–15 g'], ['Carrete', 'Tamaño 2000 – 2500'], ['Línea madre', 'Trenzado PE 0.3 – 0.6'], ['Bajo', 'Fluorocarbono 0,18 – 0,25 mm']],
      tips: ['Un bajo de fluorocarbono fino marca la diferencia en aguas claras.', 'Las luces de los puertos concentran peces pasto y depredadores al anochecer.', 'Trabaja el fondo y la media agua antes de cambiar de zona.']
    },
    {
      id: 'rockfishing', name: 'Rockfishing', scene: 'rock',
      claim: 'Pescar entre piedras, grieta a grieta.',
      type: 'Pesca ultraligera junto a la roca',
      scenario: 'Escolleras, bloques, pozas y bajos rocosos',
      intro: 'El rockfishing explora la estructura: grietas, huecos y paredes de roca donde viven depredadores de fondo. Se pesca cerca, con precisión y con señuelos de apenas unos gramos.',
      gear: [['Caña', '1,80 – 2,30 m · 0,5–10 g'], ['Carrete', 'Tamaño 1000 – 2000'], ['Línea madre', 'Trenzado PE 0.2 – 0.4'], ['Bajo', 'Fluorocarbono 0,16 – 0,22 mm']],
      tips: ['Deja caer el señuelo pegado a la pared y mantén contacto con la línea.', 'Una cabeza plomada ligera enroca menos que una pesada.', 'Mueve los pies: cada hueco se prueba con pocos lances.']
    },
    {
      id: 'eging', name: 'Eging', scene: 'night',
      claim: 'El arte japonés de pescar calamares con egi.',
      type: 'Pesca de cefalópodos con egi',
      scenario: 'Puertos, escolleras y fondos de pradera',
      intro: 'El eging utiliza la egi, un señuelo con forma de gamba, para provocar a calamares y sepias. Tirones secos de caña, caídas controladas y mucha atención a la línea: la picada suele llegar mientras la egi desciende.',
      gear: [['Caña', '2,40 – 2,70 m · egi 2.5 – 3.5'], ['Carrete', 'Tamaño 2500 bobina baja'], ['Línea madre', 'Trenzado PE 0.6 – 0.8'], ['Bajo', 'Fluorocarbono 0,22 – 0,28 mm']],
      tips: ['Cuenta la caída para conocer la profundidad y no tocar fondo.', 'Colores naturales de día, colores vivos o luminiscentes de noche.', 'Tras la picada, mantén la tensión constante: el calamar no está anzuelado como un pez.']
    },
    {
      id: 'surfcasting', name: 'Surfcasting', scene: 'beach',
      claim: 'Lances largos desde la orilla.',
      type: 'Pesca a fondo desde playa',
      scenario: 'Playas abiertas, desembocaduras y rompientes',
      intro: 'El surfcasting busca a los peces que se acercan a la orilla con el movimiento del mar. Cañas largas, plomos pesados y lances potentes para situar el cebo más allá de la rompiente.',
      gear: [['Caña', '4,20 – 4,50 m · 100–250 g'], ['Carrete', 'Tamaño 6000 – 8000 bobina cónica'], ['Línea madre', 'Monofilamento 0,25 – 0,30 mm'], ['Bajo', 'Puente cónico 0,26 – 0,57 mm']],
      tips: ['Un puente cónico protege la línea en el momento del lance.', 'Con mar de fondo, los peces se acercan a la primera y segunda rompiente.', 'Observa la playa con marea baja para localizar canales y hoyas.']
    },
    {
      id: 'embarcacion', name: 'Pesca desde embarcación', scene: 'boat',
      claim: 'Llegar donde la orilla no alcanza.',
      type: 'Jigging, spinning y fondo desde barco o kayak',
      scenario: 'Bajos, veriles, cardúmenes y aguas profundas',
      intro: 'Desde la embarcación el escenario se amplía: bajos alejados, cardúmenes en superficie y fondos profundos. Equipos cortos y potentes para trabajar jigs en vertical o lanzar a peces activos.',
      gear: [['Caña', '1,80 – 2,10 m · 20–80 g'], ['Carrete', 'Tamaño 4000 – 5000'], ['Línea madre', 'Trenzado PE 1.0 – 1.5'], ['Bajo', 'Fluorocarbono 0,35 – 0,45 mm']],
      tips: ['Usa la sonda para localizar el pasto antes de pescar.', 'Ajusta el peso del jig a la deriva y a la corriente, no solo a la profundidad.', 'Revisa nudos y anillas tras cada pez grande.']
    }
  ];

  const species = [
    {
      id: 'lubina', name: 'Lubina', latin: 'Dicentrarchus labrax', scene: 'coast',
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
      id: 'jurel', name: 'Jurel', latin: 'Trachurus trachurus', scene: 'harbor',
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
      id: 'dorada', name: 'Dorada', latin: 'Sparus aurata', scene: 'beach',
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
      id: 'anjova', name: 'Anjova', latin: 'Pomatomus saltatrix', scene: 'coast',
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
      id: 'calamar', name: 'Calamar', latin: 'Loligo vulgaris', scene: 'night',
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
      id: 'cefalopodos', name: 'Sepia y otros cefalópodos', latin: 'Sepia officinalis · Octopus vulgaris', scene: 'harbor',
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
      id: 'depredadores', name: 'Otros depredadores', latin: 'Serranos, cabrachos, palometas, bonitos…', scene: 'rock',
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
    }
  ];

  // Helper para no repetir estructura.
  const P = (o) => Object.assign({ price: null, sku: null, stock: null, photo: null, listings: { wallapop: '', vinted: '' } }, o);

  const products = [
    // ——— SEÑUELOS · VINILOS
    P({
      id: 'paddle-tail-90', name: 'Paddle Tail 90', category: 'senuelos', sub: 'vinilos', type: 'Soft Swimbait',
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
      id: 'slim-shad-120', name: 'Slim Shad 120', category: 'senuelos', sub: 'vinilos', type: 'Soft Shad',
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
      id: 'pin-tail-55', name: 'Pin Tail 55', category: 'senuelos', sub: 'vinilos', type: 'Micro vinilo',
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
    // ——— SEÑUELOS · MINNOWS
    P({
      id: 'drift-minnow-110f', name: 'Drift Minnow 110F', category: 'senuelos', sub: 'minnows', type: 'Minnow flotante',
      length: '110 mm', weight: 16, featured: true,
      summary: 'Nado amplio en la capa superficial.',
      description: 'Minnow flotante con sistema de transferencia de pesos para lanzar lejos y nadar en cuanto toca el agua. Trabaja entre 30 y 90 cm, justo donde la lubina caza en la espuma.',
      specs: { Tipo: 'Minnow flotante', Longitud: '110 mm', Peso: '16 g', Acción: 'Wobbling amplio', Material: 'ABS · anillas inox', Color: 'Sardina azul', Profundidad: '0,3 – 0,9 m' },
      when: { Condiciones: 'Espuma, rompiente, baja luz', 'Tipo de agua': 'Con espuma o tomada', Profundidad: 'Superficie', Recuperación: 'Lineal lenta', Escenario: 'Costa rocosa y playa' },
      techniques: ['spinning'], species: ['lubina', 'anjova'],
      conditions: ['costa-rocosa', 'playa', 'estuario', 'oleaje', 'noche'],
      related: ['grapa-rapida-1', 'fluoro-025', 'pe-x8-08', 'alicates-alu'],
      art: { k: 'minnow', c: ['#2f5f86', '#e8ecef'] }, listings: { wallapop: '', vinted: '', miraanuncio: '' }
    }),
    P({
      id: 'cast-minnow-90s', name: 'Cast Minnow 90S', category: 'senuelos', sub: 'minnows', type: 'Minnow hundido',
      length: '90 mm', weight: 20,
      summary: 'Compacto, pesado y fácil de lanzar contra el viento.',
      description: 'Minnow hundido de perfil compacto. Alcanza distancia con viento de cara y permite contar la caída para pescar a distintas profundidades.',
      specs: { Tipo: 'Minnow hundido', Longitud: '90 mm', Peso: '20 g', Acción: 'Rolling cerrado', Material: 'ABS · anillas inox', Color: 'Caballa', Profundidad: '0,5 – 3 m' },
      when: { Condiciones: 'Viento, distancia', 'Tipo de agua': 'Clara o movida', Profundidad: 'Media agua', Recuperación: 'Lineal o con paradas', Escenario: 'Puntas, playas, embarcación' },
      techniques: ['spinning', 'embarcacion'], species: ['lubina', 'anjova', 'jurel', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'embarcacion', 'oleaje'],
      related: ['grapa-rapida-1', 'fluoro-025', 'giratorio-rolling'],
      art: { k: 'minnow', c: ['#3f6b4f', '#e7eadf'], stripes: true }, listings: { wallapop: '' }
    }),
    // ——— SEÑUELOS · PASEANTES
    P({
      id: 'walker-120', name: 'Walker 120', category: 'senuelos', sub: 'paseantes', type: 'Paseante de superficie',
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
      id: 'blade-jig-30', name: 'Blade Jig 30', category: 'senuelos', sub: 'jigs', type: 'Casting jig',
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
      id: 'micro-jig-10', name: 'Micro Jig 10', category: 'senuelos', sub: 'jigs', type: 'Micro jig',
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
      id: 'slow-jig-60', name: 'Slow Pitch 60', category: 'senuelos', sub: 'jigs', type: 'Slow jig',
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
      id: 'vibe-70', name: 'Vibe 70', category: 'senuelos', sub: 'vibration', type: 'Lipless vibration',
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
      id: 'egi-30-night', name: 'Egi Night 3.0', category: 'senuelos', sub: 'jibioneras', type: 'Egi',
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
      id: 'egi-25-dawn', name: 'Egi Dawn 2.5', category: 'senuelos', sub: 'jibioneras', type: 'Egi',
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
      id: 'jibionera-classic', name: 'Jibionera Classic 8', category: 'senuelos', sub: 'jibioneras', type: 'Jibionera',
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
      id: 'sabiki-jurel', name: 'Sabiki Jurel nº 8', category: 'senuelos', sub: 'otros', type: 'Bajo de plumillas',
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

    // ——— CAÑAS
    P({
      id: 'ridge-902m', name: 'Ridge 902M', category: 'canas', sub: 'spinning', type: 'Caña de spinning',
      length: '2,74 m', weightRange: [10, 35], featured: true,
      summary: 'La caña de spinning para costa.',
      description: 'Caña de dos tramos con blank de carbono de módulo medio-alto. Puntera sensible para trabajar minnows y vinilos, y reserva de potencia para peces grandes junto a la roca.',
      specs: { Tipo: 'Spinning', Longitud: '2,74 m · 2 tramos', 'Acción de lance': '10 – 35 g', Acción: 'Rápida', Material: 'Carbono · anillas SiC', 'Línea recomendada': 'PE 0.8 – 1.2', 'Peso de la caña': '165 g' },
      when: { Condiciones: 'Costa abierta, viento moderado', 'Tipo de agua': 'Cualquiera', Profundidad: 'Superficie a media agua', Recuperación: 'Lineal y jerking', Escenario: 'Costa rocosa y playas' },
      techniques: ['spinning'], species: ['lubina', 'anjova', 'depredadores'],
      conditions: ['costa-rocosa', 'playa', 'espigon', 'oleaje'],
      related: ['arc-3000', 'pe-x8-08', 'fluoro-025', 'drift-minnow-110f'],
      art: { k: 'rod', c: ['#2c3230', '#8b6d4c'] }, listings: { wallapop: '' }
    }),
    P({
      id: 'drift-762l', name: 'Drift 762L', category: 'canas', sub: 'light-spinning', type: 'Caña de light spinning',
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
      id: 'rockline-742ul', name: 'Rockline 742UL', category: 'canas', sub: 'rockfishing', type: 'Caña de rockfishing',
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
      id: 'tide-egi-862m', name: 'Tide Egi 862M', category: 'canas', sub: 'eging', type: 'Caña de eging',
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
      id: 'shore-4203', name: 'Shore 4203', category: 'canas', sub: 'surfcasting', type: 'Caña de surfcasting',
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
      id: 'deep-662mh', name: 'Deep 662MH', category: 'canas', sub: 'embarcacion', type: 'Caña de embarcación',
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
      id: 'arc-3000', name: 'Arc 3000', category: 'carretes', sub: 'spinning', type: 'Carrete de spinning',
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
      id: 'arc-2500s', name: 'Arc 2500S', category: 'carretes', sub: 'eging', type: 'Carrete bobina baja',
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
      id: 'arc-1000', name: 'Arc 1000', category: 'carretes', sub: 'spinning', type: 'Carrete ultraligero',
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
      id: 'longshore-8000', name: 'Longshore 8000', category: 'carretes', sub: 'surfcasting', type: 'Carrete de surfcasting',
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
      id: 'pe-x8-08', name: 'Braid X8 PE 0.8', category: 'lineas', sub: 'trenzado', type: 'Trenzado 8 hilos',
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
      id: 'pe-x4-03', name: 'Braid X4 PE 0.3', category: 'lineas', sub: 'trenzado', type: 'Trenzado 4 hilos',
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
      id: 'fluoro-025', name: 'Fluorocarbono 0,25', category: 'lineas', sub: 'fluorocarbono', type: 'Fluorocarbono 100%',
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
      id: 'mono-030', name: 'Mono 0,30', category: 'lineas', sub: 'monofilamento', type: 'Monofilamento',
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
      id: 'bajo-conico', name: 'Puente cónico 0,26–0,57', category: 'lineas', sub: 'bajos', type: 'Bajo cónico',
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
      id: 'jig-head-3', name: 'Jig Head 3 g', category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
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
      id: 'jig-head-7', name: 'Jig Head 7 g', category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
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
      id: 'jig-head-10', name: 'Jig Head 10 g', category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
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
      id: 'jig-head-21', name: 'Jig Head 21 g', category: 'accesorios', sub: 'cabezas-plomadas', type: 'Cabeza plomada',
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
      id: 'grapa-rapida-1', name: 'Grapa rápida nº 1', category: 'accesorios', sub: 'grapas', type: 'Grapa',
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
      id: 'giratorio-rolling', name: 'Giratorio rolling nº 8', category: 'accesorios', sub: 'giratorios', type: 'Giratorio',
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
      id: 'anzuelo-chinu-2', name: 'Anzuelo Chinu nº 2', category: 'accesorios', sub: 'anzuelos', type: 'Anzuelo',
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
      id: 'caja-organizadora', name: 'Caja organizadora 3600', category: 'accesorios', sub: 'cajas', type: 'Caja de señuelos',
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
      id: 'alicates-alu', name: 'Alicates de aluminio', category: 'accesorios', sub: 'herramientas', type: 'Alicates',
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
      id: 'mochila-coastline', name: 'Mochila Coastline 22 L', category: 'accesorios', sub: 'mochilas', type: 'Mochila',
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
      id: 'bolsa-tide', name: 'Bolsa Tide 8 L', category: 'accesorios', sub: 'bolsas', type: 'Bolsa de hombro',
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
      id: 'gafas-polarizadas', name: 'Gafas polarizadas Shoreline', category: 'accesorios', sub: 'complementos', type: 'Gafas polarizadas',
      length: 'Lente gris', weight: null,
      summary: 'Ver bajo la superficie.',
      description: 'Gafas con lentes polarizadas que eliminan reflejos para leer el fondo, ver peces y proteger los ojos durante el lance.',
      specs: { Tipo: 'Gafas polarizadas', Lente: 'Gris · categoría 3', Montura: 'TR90', Incluye: 'Funda y cordón flotante', Color: 'Grafito' },
      techniques: ['spinning', 'rockfishing', 'light-spinning', 'embarcacion'], species: [],
      conditions: [],
      related: ['mochila-coastline', 'alicates-alu'],
      art: { k: 'glasses', c: ['#2b2e30', '#4f6a74'] }, listings: { wallapop: '', vinted: '' }
    })
  ];

  const journal = [
    {
      slug: 'como-elegir-un-vinilo-para-lubina', title: 'Cómo elegir un vinilo para lubina', cat: 'Guías de pesca', read: 5, scene: 'coast',
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
      slug: 'spinning-desde-costa-equipamiento-basico', title: 'Spinning desde costa: equipamiento básico', cat: 'Equipamiento', read: 6, scene: 'rock',
      excerpt: 'Caña, carrete, línea y cinco señuelos para empezar sin llenar la mochila.',
      techniques: ['spinning'], species: ['lubina', 'anjova'], products: ['ridge-902m', 'arc-3000', 'pe-x8-08', 'fluoro-025', 'drift-minnow-110f'],
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
      slug: 'que-gramaje-utilizar-segun-las-condiciones', title: 'Qué gramaje utilizar según las condiciones', cat: 'Consejos', read: 4, scene: 'harbor',
      excerpt: 'Viento, oleaje, corriente y profundidad. Cómo ajustar el peso de tu señuelo.',
      techniques: ['spinning', 'light-spinning'], species: [], products: ['jig-head-7', 'jig-head-10', 'jig-head-21', 'cast-minnow-90s'],
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
      slug: 'como-elegir-un-fluorocarbono', title: 'Cómo elegir un fluorocarbono', cat: 'Equipamiento', read: 4, scene: 'river',
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
      slug: 'rockfishing-equipo-basico-para-empezar', title: 'Rockfishing: equipo básico para empezar', cat: 'Técnicas', read: 5, scene: 'rock',
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
      slug: 'eging-primeros-pasos', title: 'Eging: primeros pasos para pescar calamar', cat: 'Especies', read: 5, scene: 'night',
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
      slug: 'salir-al-amanecer-checklist', title: 'Salir al amanecer: lo que no puede faltar', cat: 'Outdoor', read: 3, scene: 'dawn',
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
