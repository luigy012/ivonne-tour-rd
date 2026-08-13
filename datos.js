/* ============================================================
   IVONNE TOUR RD — EL CATALOGO

   Aqui vive TODO lo que se vende: las excursiones de un dia, los
   paquetes de varios dias y los extras que se pueden anadir a
   cualquiera de los dos.

   Este archivo lo cargan DOS paginas:
     index.html    → para pintar las tarjetas
     reservar.html → para saber que fue lo que el cliente eligio

   Por eso vive aqui fuera y no dentro de index.html: si los datos
   estuvieran repetidos en las dos paginas, el dia que cambies un
   precio lo cambiarias en una y no en la otra, y el cliente veria
   US$89 en la tarjeta y US$95 al ir a pagar.

   OJO: es un script normal, NO un modulo. Los modulos de
   JavaScript no cargan cuando la pagina se abre a doble clic
   (file://), y esta web tiene que poder abrirse asi.

   ¿Vas a cambiar precios, fotos o textos? Es aqui, y en ningun
   otro sitio.
   ============================================================ */

/* ============================================================
   FOTOS REALES DE IVONNE TOUR RD
   Todas las fotos viven en la carpeta images/, al lado de este
   archivo. Aqui abajo esta la lista completa de lo que hay.
   ¿Agregaste fotos nuevas? Sumalas a IMGS y ya entran solas.
   ============================================================ */
const IMGS = [
  'images/amigas-bote-1.jpg',
  'images/amigas-bote-2.jpg',
  'images/base-cuatrimotos.jpg',
  'images/cenote-selfie.jpg',
  'images/cuatrimoto-playa.jpg',
  'images/familia-cabras.jpg',
  'images/familia-safari.jpg',
  'images/grupo-cascada-1.jpg',
  'images/grupo-cascada-2.jpg',
  'images/grupo-evolution-1.jpg',
  'images/grupo-evolution-2.jpg',
  'images/grupo-palapa-2.jpg',
  'images/ivonne-scape-park.jpg',
  'images/marina-botes.jpg',
  'images/mirador-valle-mar.jpg',
  'images/nina-caballo.jpg',
  'images/nina-tirolesa.jpg',
  'images/rio-grupo.jpg'
];

/* Para los huecos que no tienen foto asignada a mano.
   La misma clave siempre devuelve la misma foto, asi la web
   no cambia de imagen cada vez que se recarga. */
function pickFoto(clave){
  let h = 0;
  for(let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) >>> 0;
  return IMGS[h % IMGS.length];
}

/* ============================================================
   Cada clave es un hueco del diseño; el valor es el archivo.
   ¿Quieres cambiar una foto? Cambia SOLO el nombre del archivo.
   ============================================================ */
const FOTO = {
  /* --- las 3 categorias del hero y sus tarjetas --- */
  'ivonnetierra9': 'images/base-cuatrimotos.jpg',
  'ivonneagua5': 'images/amigas-bote-1.jpg',
  'ivonneeventos7': 'images/grupo-palapa-2.jpg',
  'buggy4': 'images/cuatrimoto-playa.jpg',
  'horse7': 'images/nina-caballo.jpg',
  'safari2': 'images/familia-safari.jpg',
  'snorkel3': 'images/amigas-bote-2.jpg',
  'catamaran8': 'images/marina-botes.jpg',
  'jetski6': 'images/amigas-bote-1.jpg',
  'dinner5': 'images/grupo-palapa-2.jpg',
  'party9': 'images/grupo-evolution-2.jpg',
  'show1': 'images/grupo-evolution-1.jpg',
  /* --- carrusel TRIBU --- */
  'samana2': 'images/amigas-bote-2.jpg',
  'barro8': 'images/base-cuatrimotos.jpg',
  'fiesta3': 'images/grupo-palapa-2.jpg',
  'bahia5': 'images/marina-botes.jpg',
  'selva7': 'images/nina-tirolesa.jpg',
  'arrecife4': 'images/amigas-bote-1.jpg',
  'cena11': 'images/grupo-palapa-2.jpg',
  'safari12': 'images/familia-safari.jpg',
  'hoyoazul6': 'images/cenote-selfie.jpg',
  'merengue9': 'images/grupo-evolution-2.jpg',
  'limon14': 'images/grupo-cascada-1.jpg',
  'ballena15': 'images/mirador-valle-mar.jpg',
  /* --- excursiones por destino --- */
  'snorkelx': 'images/amigas-bote-2.jpg',
  'catx': 'images/marina-botes.jpg',
  'jetx': 'images/amigas-bote-1.jpg',
  'buggyx': 'images/cuatrimoto-playa.jpg',
  'saonax': 'images/amigas-bote-1.jpg',
  'hoyox': 'images/cenote-selfie.jpg',
  'ziplinex': 'images/nina-tirolesa.jpg',
  'telefx': 'images/mirador-valle-mar.jpg',
  'charcosx': 'images/grupo-cascada-2.jpg',
  'doradax': 'images/amigas-bote-2.jpg',
  'cityvx': 'images/familia-safari.jpg',
  'monkeyx': 'images/familia-cabras.jpg',
  'ballenasx': 'images/mirador-valle-mar.jpg',
  'limonx': 'images/grupo-cascada-1.jpg',
  'cayox': 'images/marina-botes.jpg',
  'rinconx': 'images/mirador-valle-mar.jpg',
  'haitisesx': 'images/rio-grupo.jpg',
  'kayaksx': 'images/rio-grupo.jpg',
  'zonacolx': 'images/grupo-evolution-1.jpg',
  'tresojosx': 'images/cenote-selfie.jpg',
  'farox': 'images/grupo-evolution-2.jpg',
  'acuariox': 'images/amigas-bote-2.jpg',
  /* --- paquetes --- */
  'pcaribe6': 'images/marina-botes.jpg',
  'pterr4': 'images/base-cuatrimotos.jpg',
  'pepica9': 'images/grupo-evolution-1.jpg',
  'ptotal3': 'images/grupo-cascada-2.jpg',
  'promant7': 'images/mirador-valle-mar.jpg',

  /* --- HOTELES DE LOS PAQUETES ---------------------------------
     Ivonne: aqui van las fotos REALES de cada hotel (fachada,
     habitacion y piscina). Por ahora estan de relleno con fotos
     de tours. Sube las fotos a images/ y cambia solo el nombre
     del archivo de cada linea; los 3 seeds de un hotel son la
     galeria que se abre en "Ver info del hotel".              */
  /* las mismas tres del hotel en tour-del-sur.html, y en el mismo orden:
     es el mismo hotel, no puede enseñar otra cosa aquí que allá */
  'hsur':      'images/marina-botes.jpg',
  'hsurb':     'images/grupo-palapa-2.jpg',
  'hsurc':     'images/amigas-bote-1.jpg',
  'hcaribe':   'images/marina-botes.jpg',
  'hcaribeb':  'images/grupo-palapa-2.jpg',
  'hcaribec':  'images/amigas-bote-1.jpg',
  'hterr':     'images/ivonne-scape-park.jpg',
  'hterrb':    'images/base-cuatrimotos.jpg',
  'hterrc':    'images/rio-grupo.jpg',
  'hepica':    'images/grupo-cascada-2.jpg',
  'hepicab':   'images/rio-grupo.jpg',
  'hepicac':   'images/cenote-selfie.jpg',
  'htotal':    'images/mirador-valle-mar.jpg',
  'htotalb':   'images/grupo-palapa-2.jpg',
  'htotalc':   'images/marina-botes.jpg',
  'hromant':   'images/mirador-valle-mar.jpg',
  'hromantb':  'images/grupo-palapa-2.jpg',
  'hromantc':  'images/amigas-bote-2.jpg'
};

function PIC(seed, w, h) {
  // Si el hueco no tiene foto asignada arriba, se le da una del monton.
  return encodeURI(FOTO[seed] || pickFoto(seed));
}

/* ── Precio y oferta ───────────────────────────────────────────────
   Casi todos los paquetes salen de Punta Cana, cobran en dólares y
   tienen un precio suelto tachado. El Tour del Sur no: sale del sur
   del país, cobra en pesos y no tiene precio de comparación, porque
   nadie vende ese viaje suelto.

     TPRE    → escribe el precio con SU moneda (t.cur, o '$' si no dice)
     TOFERTA → ¿hay precio tachado que enseñar?

   Todo lo que pinte un precio tiene que pasar por aquí. Si se escribe
   el '$' a pelo, el Tour del Sur sale con "$5900" en vez de
   "RD$5,900"; y si se da por hecho que t.was existe, sale
   "Ahorra $NaN" y un tachado que dice "$null".                     */
const TPRE = (t, n) => (t.cur || '$') + n.toLocaleString('en-US');
const TOFERTA = t => !!(t.was && t.was > t.now);

/* Cada paquete lleva ahora:
     noches   → para el badge "3 Días · 2 Noches"
     hotel    → la ficha de "Dónde duermes" (nombre, zona, tipo de
                habitación, 3 fotos y lo que da el hotel)
     incluye  → la lista completa de lo que va pagado, comidas y
                noches de hotel incluidas
   Si un paquete NO trae alojamiento, pon  hotel: null  y la tarjeta
   se arma sola sin el bloque.

   Campos opcionales que hoy solo usa el Tour del Sur (los demás
   paquetes siguen igual, no hay que tocarlos):
     link → si está, la tarjeta NO abre el "Ver Info" de siempre: se
            va a su propia página, que es una landing completa con su
            ruta pueblo por pueblo, sus videos y su precio explicado.
     cur  → moneda. Por defecto '$'.
     was  → precio suelto tachado. Si es null, no se enseña ni el
            tachado ni el "Ahorra" ni el "Te quedas con".
     paradas → los sitios donde se recoge gente. Solo lo usa el Tour
            del Sur, que recoge pueblo por pueblo; los demás salen de
            Punta Cana y usan la lista normal de reservar.html.

   El campo `id` NO es decorativo: es lo que viaja por la direccion
   cuando el cliente pulsa "Apartar mi cupo"
   (reservar.html?tipo=paquete&id=caribe-total), y es como la pagina
   de reserva sabe que paquete pintar. Si le cambias el id a uno, los
   enlaces viejos dejan de encontrarlo.                             */
const TOURS = [{
    /* EL TOUR DEL SUR — el único que no sale de Punta Cana, sino que VA hacia
       Punta Cana recogiendo pueblo por pueblo. Por eso es el único con página
       propia (link) y el único que cobra en pesos (cur). Todo lo que dice esta
       ficha está sacado de tour-del-sur.html: si allí se cambia un precio o una
       parada, hay que cambiarlo aquí también. */
    id: 'tour-del-sur',
    img: 'psur2',
    days: '2 Días',
    noches: '1 Noche',
    name: 'Tour del Sur a Punta Cana',
    desc: 'Te busco en tu pueblo de madrugada y te devuelvo la noche siguiente. Guagua, hotel, playa y discoteca en un solo precio.',
    hook: 'Salgo de Duvergé a las 3 de la mañana y voy recogiendo por Barahona, Azua, Baní y San Cristóbal. Dos días en Punta Cana, y una amanecida.',
    itinCorto: ['Salida de madrugada, llegada a Bávaro y tarde de playa', 'Desayuno, última mañana de playa y regreso a tu pueblo'],
    plus: ['La amanecida completa, con la entrada a la discoteca pagada', 'La playa de madrugada, que es otra cosa', 'Vamos y volvemos en grupo: nadie se queda tirado'],
    chips: ['Salida desde el sur', 'Hotel en Bávaro', 'Playa los 2 días', 'Amanecida'],
    rating: '4.9',
    reviews: 87,
    zona: 'Sale de Duvergé · recoge por todo el sur',
    viajeros: 240,
    nivel: 'Relajado',
    idiomas: 'Español',
    salida: 'Arranca en Duvergé a las 3:00 AM y va parando en Vicente Noble, Barahona, Azua, Baní, San Cristóbal y Santo Domingo. Llegada a Punta Cana sobre las 11:30 AM. De vuelta te dejo en el mismo sitio donde te monté.',
    cur: 'RD$',
    was: null,
    now: 5900,
    link: 'tour-del-sur.html',
    /* Los pueblos donde se monta la gente, en el orden en que pasa la guagua.
       Salen del texto de `salida` de aquí arriba: si cambia la ruta, cambian
       los dos. Es lo que ofrece el desplegable del paso 2 de la reserva —
       a quien sale de Barahona no se le puede ofrecer "Plaza Bávaro". */
    paradas: ['Duvergé','Vicente Noble','Barahona','Azua','Baní','San Cristóbal','Santo Domingo'],
    noincluye: ['Los almuerzos y las cenas', 'Las bebidas de la discoteca', 'Compras, souvenirs y propinas', 'Excursiones aparte, como Saona o el catamarán'],
    llevar: ['Cédula', 'Traje de baño y toalla', 'Ropa para la noche', 'Bloqueador', 'Cargador', 'Efectivo para la comida', 'Una chaqueta ligera'],
    cancela: 'Con 5 días o más de aviso, te paso el abono para la salida siguiente sin cobrarte nada. Con menos, el cupo ya está pagado al hotel y a la guagua: solo se puede pasar a otra persona.',
    itin: ['Arranca la guagua en Duvergé a las 3:00 AM y va recogiendo pueblo por pueblo. Llegada a Punta Cana, dejas el bulto en el hotel y sales. Tarde de playa en Bávaro y, a las 10:00 PM, empieza la amanecida.', 'Desayuno en el hotel sin prisa, última mañana de playa o piscina y a las 2:00 PM sale la guagua de vuelta hasta donde te monté.'],
    hotel: {
      name: 'Hotel en Bávaro',
      stars: 3,
      zona: 'Bávaro, Punta Cana · a 10 minutos de la playa',
      tipo: '1 noche en habitación doble con aire y baño privado',
      img: 'hsur',
      feats: ['Aire acondicionado', 'Agua caliente', 'Piscina', 'Wifi', 'Baño privado', 'Recepción 24 horas']
    },
    comidas: '1 desayuno',
    incluye: ['La guagua ida y vuelta, con aire, desde tu pueblo', '1 noche de hotel en Bávaro, ya pagada', 'El desayuno del segundo día', 'La entrada a la discoteca: la amanecida va incluida', 'Playa de Bávaro los dos días, con sombra y sillas', 'Alguien del equipo con el grupo del primer pueblo al último'],
    inc: ['transporte', 'hotel', 'guia'],
    abono: 1500,
    max: 'Máx 30 personas',
    tags: [['noche','1 noche en Bávaro'],['fiesta','La amanecida, con la entrada pagada'],['comida','1 desayuno'],['van','Te recojo en tu pueblo']],
    cupo: 'Una salida al mes · 30 cupos'
  },

  {
    id: 'caribe-total',
    img: 'pcaribe6',
    days: '3 Días',
    noches: '2 Noches',
    best: true,
    name: 'Caribe Total',
    desc: 'Saona el primer día. Arrecifes el segundo. La tercera noche no la pasas en el hotel.',
    hook: 'Saona el primer día, arrecifes el segundo y la Zona Colonial el tercero. Duermes en Bávaro las dos noches.',
    itinCorto: ['Isla Saona completa, en catamarán', 'Arrecifes escondidos y playa del hotel', 'Zona Colonial y salida de noche'],
    plus: ['Cena en la playa la noche de Saona', 'Salida de noche a la discoteca, con la entrada pagada', 'Desayunas sin reloj: nadie te apura'],
    chips: ['Isla Saona', 'Alojamiento 4★', 'Open Bar', 'Fiesta & Discoteca'],
    rating: '4.9',
    reviews: 186,
    zona: 'Sale de Bávaro · Saona y Zona Colonial',
    viajeros: 1240,
    nivel: 'Relajado',
    idiomas: 'Español · Inglés',
    salida: 'Te recojo a las 7:30 AM el primer día y te devuelvo el tercero antes de las 6:00 PM.',
    was: 349,
    now: 249,
    noincluye: ['Los vuelos y el traslado del aeropuerto', 'Propinas del guía y del chofer', 'Souvenirs y compras tuyas', 'Bebidas fuera de las que van incluidas'],
    llevar: ['Traje de baño y toalla', 'Muda seca y ropa ligera', 'Protector solar y gorra', 'Efectivo para propinas y compras', 'Copia del pasaporte o cédula'],
    cancela: 'Cancelas gratis hasta 48 horas antes y te devuelvo el depósito completo. Cambiar la fecha no cuesta nada si hay cupo.',
    itin: ['Isla Saona completa: piscina natural, almuerzo en la playa y regreso en catamarán.', 'Arrecifes escondidos en la mañana y tarde libre en la playa del hotel.', 'Zona colonial o playa, y salida de noche antes del regreso.'],
    hotel: {
      name: 'Hotel Playa Bávaro',
      stars: 4,
      zona: 'Bávaro, Punta Cana · a 6 minutos de la playa',
      tipo: '2 noches en habitación doble con aire y balcón',
      img: 'hcaribe',
      feats: ['Desayuno buffet los 2 días', 'Piscina y área de jacuzzi', 'Aire acondicionado en la habitación', 'Wifi en todo el hotel', 'Toallas y sillas de playa', 'Caja fuerte y agua incluida']
    },
    comidas: '3 desayunos · 2 almuerzos · 1 cena',
    incluye: ['2 noches de hotel 4★ con desayuno, ya pagadas', '3 desayunos, 2 almuerzos y 1 cena', 'Traslado desde donde te quedes y entre cada actividad', 'Guía bilingüe contigo los 3 días', 'Catamarán, entradas y equipo de snorkel', 'Open bar en Saona y en la salida de noche', 'Impuestos, propinas del hotel y seguro de viaje'],
    inc: ['transporte', 'comidas', 'hotel', 'guia'],
    abono: 60,
    max: 'Máx 14 personas',
    tags: [['noche','2 noches en Bávaro'],['fiesta','Discoteca y vida nocturna'],['comida','3 desayunos · 2 almuerzos · 1 cena'],['copa','Open bar en Saona']],
    cupo: 'Quedan 4 cupos este mes'
  },

  {
    id: 'lodo-selva-rio',
    img: 'pterr4',
    days: '2 Días',
    noches: '1 Noche',
    name: 'Lodo, Selva y Río',
    desc: 'Lodo hasta las rodillas, cruzas la selva colgado de un cable y un río al final para quitártelo todo.',
    hook: 'Tres cosas en dos días: buggy por el campo, cruzas la selva colgado de un cable y un río para quitarte el lodo. De noche, fogata, música y el pueblo.',
    itinCorto: ['Buggy por el campo, cueva taína y playa Macao', 'Cruzas la selva colgado de un cable y te bañas en el río'],
    plus: ['Cena típica cocinada ahí mismo, en el rancho', 'Fogata y música cuando baja el sol', 'Amaneces con el río a diez pasos'],
    chips: ['Buggy por el campo', 'Cable sobre la selva', 'Río al final', 'Noche en el rancho'],
    rating: '4.8',
    reviews: 132,
    zona: 'Sale de Bávaro · Anamuya y Higüey',
    viajeros: 870,
    nivel: 'Extremo',
    idiomas: 'Español · Inglés',
    salida: 'Te recojo a las 8:00 AM el primer día y te devuelvo el segundo alrededor de las 5:00 PM.',
    was: 199,
    now: 159,
    noincluye: ['Los vuelos y el traslado del aeropuerto', 'Propinas del guía y del chofer', 'Fotos y videos del parque', 'Bebidas alcohólicas'],
    llevar: ['Ropa que se pueda ensuciar', 'Muda seca y calzado cerrado', 'Traje de baño y toalla', 'Protector solar y repelente', 'Efectivo para propinas'],
    cancela: 'Cancelas gratis hasta 48 horas antes y te devuelvo el depósito completo. Si llueve fuerte, movemos la actividad, no la pierdes.',
    itin: ['Buggies por caminos de campo, parada en cueva y playa Macao. Almuerzo típico y noche en el rancho: fogata, música y cena criolla.', 'Cruzas la selva colgado de un cable, de árbol en árbol, y bajas al río a quitarte el lodo antes de volver.'],
    hotel: {
      name: 'Rancho Anamuya Lodge',
      stars: 3,
      zona: 'Anamuya, Higüey · en medio del campo, a 35 min de Bávaro',
      tipo: '1 noche en cabaña doble con ventilador y terraza',
      img: 'hterr',
      feats: ['Desayuno criollo servido en la terraza', 'Piscina y río al lado del rancho', 'Agua caliente y baño privado', 'Wifi en el área común', 'Parqueo y área para secar el equipo', 'Cena típica la noche que duermes ahí']
    },
    comidas: '1 desayuno · 2 almuerzos · 1 cena',
    incluye: ['1 noche en el lodge con desayuno, ya pagada', '2 almuerzos típicos y 1 cena', 'Buggy, cable sobre la selva y entrada al río', 'Traslado desde donde te quedes y de vuelta', 'Guía bilingüe los 2 días', 'Casco, chaleco y todo el equipo de seguridad', 'Impuestos y seguro de viaje'],
    inc: ['transporte', 'comidas', 'hotel', 'guia'],
    abono: 40,
    max: 'Máx 12 personas',
    tags: [['noche','1 noche en el campo'],['fiesta','Fogata, música y salida al pueblo'],['comida','1 desayuno · 2 almuerzos · 1 cena'],['van','El río a diez pasos de la cabaña']],
    cupo: 'Quedan 6 cupos este mes'
  },

  {
    id: 'exploracion-epica',
    img: 'pepica9',
    days: '2 Días',
    noches: '1 Noche',
    name: 'Exploración Épica',
    desc: 'Kayak río abajo, almuerzo a la orilla del agua y cenotes de agua dulce al otro día.',
    hook: 'Kayak río abajo el primer día, cenotes de agua dulce el segundo. Duermes en una cabaña frente al río.',
    itinCorto: ['Kayak río abajo entre la selva', 'Cenotes de agua dulce y caminata guiada'],
    plus: ['Cena a la orilla del agua, con luz de vela', 'Cielo sin luces de ciudad: aquí sí se ven las estrellas', 'Los kayaks quedan ahí por si madrugas'],
    chips: ['Kayak', 'Cenotes', 'Eco-lodge', 'Comidas'],
    rating: '5.0',
    reviews: 74,
    zona: 'Sale de Bávaro · La Romana y Río Chavón',
    viajeros: 410,
    nivel: 'Moderado',
    idiomas: 'Español · Inglés',
    salida: 'Te recojo a las 7:00 AM el primer día y te devuelvo el segundo alrededor de las 5:30 PM.',
    was: 179,
    now: 139,
    noincluye: ['Los vuelos y el traslado del aeropuerto', 'Propinas del guía y del chofer', 'Equipo de fotografía acuática', 'Bebidas alcohólicas'],
    llevar: ['Traje de baño y toalla', 'Zapatos de agua o sandalias con correa', 'Muda seca y suéter ligero para la noche', 'Repelente y protector solar biodegradable', 'Efectivo para propinas'],
    cancela: 'Cancelas gratis hasta 48 horas antes y te devuelvo el depósito completo. Grupo pequeño: si cambias la fecha, avísame con tiempo.',
    itin: ['Kayak río abajo entre la selva y almuerzo a la orilla del agua.', 'Cenotes de agua dulce y caminata guiada antes del regreso.'],
    hotel: {
      name: 'Eco-Lodge Río Chavón',
      stars: 3,
      zona: 'La Romana · cabañas de madera frente al río',
      tipo: '1 noche en cabaña doble con mosquitero y hamaca',
      img: 'hepica',
      feats: ['Desayuno de finca con fruta del patio', 'Cabaña frente al río, sin ruido', 'Agua caliente y baño privado', 'Luz solar y wifi en la recepción', 'Kayaks del lodge a tu disposición', 'Café y agua todo el día']
    },
    comidas: '1 desayuno · 2 almuerzos · 1 cena',
    incluye: ['1 noche en el eco-lodge con desayuno, ya pagada', '2 almuerzos a la orilla del agua y 1 cena', 'Kayak, chaleco y entrada a los cenotes', 'Traslado desde donde te quedes y de vuelta', 'Guía bilingüe los 2 días', 'Caminata guiada por el sendero del río', 'Impuestos y seguro de viaje'],
    inc: ['transporte', 'comidas', 'hotel', 'guia'],
    abono: 35,
    max: 'Máx 10 personas',
    tags: [['noche','1 noche frente al río'],['fiesta','Cena a luz de vela y cielo con estrellas'],['comida','1 desayuno · 2 almuerzos · 1 cena'],['van','Kayaks a tu disposición']],
    cupo: 'Grupos pequeños · quedan 3 cupos'
  },

  {
    id: 'aventura-total-360',
    img: 'ptotal3',
    days: '3 Días',
    noches: '2 Noches',
    name: 'Aventura Total 360',
    desc: 'Montaña el primer día, catamarán el segundo, pueblo y comida de verdad el tercero.',
    hook: 'Montaña, mar y pueblo en tres días. Duermes dos noches en el malecón de Samaná.',
    itinCorto: ['Safari de montaña, finca típica y mirador', 'Día completo de mar: catamarán y snorkel', 'Pueblo, comida local y noche libre'],
    plus: ['Dos cenas frente a la bahía, ya incluidas', 'Bares y música a caminar de tu cuarto', 'La tercera noche es tuya: la camioneta se queda contigo'],
    chips: ['Todo incluido', 'Guía privado', 'Traslados VIP', 'Hotel'],
    rating: '4.9',
    reviews: 211,
    zona: 'Sale de Bávaro · Samaná, montaña y mar',
    viajeros: 1580,
    nivel: 'Moderado',
    idiomas: 'Español · Inglés · Francés',
    salida: 'Te recojo a las 6:30 AM el primer día (Samaná queda a 4 horas) y te devuelvo el tercero antes de las 7:00 PM.',
    was: 399,
    now: 299,
    noincluye: ['Los vuelos y el traslado del aeropuerto', 'Propinas del guía y del chofer', 'Souvenirs y compras tuyas', 'Las cenas de la noche libre del tercer día'],
    llevar: ['Traje de baño y toalla', 'Ropa ligera y una muda seca', 'Calzado cerrado para la montaña', 'Protector solar, gorra y lentes', 'Efectivo para propinas y compras'],
    cancela: 'Cancelas gratis hasta 48 horas antes y te devuelvo el depósito completo. Es el más pedido en temporada alta: reserva con tiempo.',
    itin: ['Safari de montaña, finca típica y mirador con vista al mar.', 'Día completo de mar: catamarán, snorkel y playa.', 'Cultura y despedida: pueblo, comida local y noche libre.'],
    hotel: {
      name: 'Hotel Bahía Samaná',
      stars: 4,
      zona: 'Samaná · frente al malecón, con vista a la bahía',
      tipo: '2 noches en habitación doble con vista al mar',
      img: 'htotal',
      feats: ['Desayuno buffet los 2 días', 'Piscina con vista a la bahía', 'Aire acondicionado y TV por cable', 'Wifi en todo el hotel', 'Restaurantes y malecón a pie', 'Recepción 24 horas y caja fuerte']
    },
    comidas: '3 desayunos · 3 almuerzos · 2 cenas',
    incluye: ['2 noches de hotel 4★ con desayuno, ya pagadas', '3 desayunos, 3 almuerzos y 2 cenas', 'Traslado privado desde donde te quedes, los 3 días', 'Guía privado solo para tu grupo', 'Safari, catamarán, snorkel y todas las entradas', 'La camioneta se queda contigo, no se va', 'Impuestos, propinas del hotel y seguro de viaje'],
    inc: ['transporte', 'comidas', 'hotel', 'guia'],
    abono: 75,
    max: 'Máx 16 personas',
    tags: [['noche','2 noches en el malecón de Samaná'],['fiesta','Bares, música y restaurantes a pie'],['comida','3 desayunos · 3 almuerzos · 2 cenas'],['van','La camioneta se queda contigo']],
    cupo: 'El más pedido en temporada alta'
  },

  {
    id: 'escape-romantico',
    img: 'promant7',
    days: '2 Días',
    noches: '1 Noche',
    name: 'Escape Romántico',
    desc: 'Spa frente al mar, cena privada bajo las estrellas y catamarán al atardecer. Ustedes dos y nadie más.',
    hook: 'Spa y cena privada el primer día, catamarán al atardecer el segundo. Una noche en suite, ustedes dos.',
    itinCorto: ['Spa de pareja y cena privada bajo las estrellas', 'Catamarán al atardecer, sin prisa'],
    plus: ['Cena privada bajo las estrellas, su mesa sola', 'Jacuzzi en la suite y una botella esperando', 'Check-out tarde: se levantan cuando quieran'],
    chips: ['Cena gourmet', 'Spa', 'Catamarán', 'Suite'],
    rating: '5.0',
    reviews: 96,
    zona: 'Sale de Bávaro · Cap Cana',
    viajeros: 320,
    nivel: 'Relajado',
    idiomas: 'Español · Inglés',
    salida: 'Los recojo a la hora que ustedes quieran el primer día y los devuelvo el segundo después del atardecer.',
    was: 259,
    now: 199,
    noincluye: ['Los vuelos y el traslado del aeropuerto', 'Propinas del spa y del restaurante', 'Tratamientos extra del spa', 'Botellas adicionales de vino'],
    llevar: ['Traje de baño y ropa de playa', 'Una muda para la cena', 'Protector solar', 'Suéter ligero para el catamarán', 'Efectivo para propinas'],
    cancela: 'Cancelas gratis hasta 5 días antes: la suite y la cena privada se reservan con anticipación. Cambiar la fecha no cuesta nada si hay disponibilidad.',
    itin: ['Llegada, spa de pareja frente al mar y cena privada bajo las estrellas.', 'Catamarán al atardecer con bebidas y regreso sin prisa.'],
    hotel: {
      name: 'Boutique Cap Cana Suites',
      stars: 5,
      zona: 'Cap Cana · suites frente al mar, zona tranquila',
      tipo: '1 noche en suite de pareja con jacuzzi y terraza',
      img: 'hromant',
      feats: ['Desayuno servido en la terraza', 'Jacuzzi privado dentro de la suite', 'Botella de vino de bienvenida', 'Piscina de adultos y playa privada', 'Aire acondicionado y wifi', 'Check-out tarde sin costo']
    },
    comidas: '1 desayuno · 1 almuerzo · cena privada',
    incluye: ['1 noche en suite de pareja, ya pagada', 'Desayuno en la terraza, 1 almuerzo y la cena privada', 'Spa de pareja frente al mar', 'Catamarán al atardecer con bebidas', 'Traslado privado desde donde se queden', 'Decoración de la habitación el día que llegan', 'Impuestos, propinas del hotel y seguro de viaje'],
    inc: ['transporte', 'comidas', 'hotel', 'guia'],
    abono: 50,
    max: 'Solo para 2 personas',
    tags: [['noche','1 noche en suite con jacuzzi'],['fiesta','Cena privada bajo las estrellas'],['spa','Spa de pareja frente al mar'],['copa','Botella de vino esperando']],
    cupo: 'Se reserva con 5 días de anticipación'
  }
];

/* ============================================================
   DATOS — cambia todo aqui
   cada excursion: id, dest, name, time, tag('fav'|'hot'|'top'|null),
   tagText, rating, reviews, zona, viajeros, nivel, idiomas, hook,
   media:[...], salidas:[...], incluye:[...], llevar:[...],
   facts:[[icono,texto],...], cancela, price, abono
   ============================================================ */

/* ── MEDIA: fotos + videos de cada excursion ──────────────────
   M(id, nFotos, nVideos) arma la galeria sola, repartiendo las
   fotos que hay en la carpeta images/ (ver la lista IMGS arriba).
   Cada excursion recibe siempre la misma combinacion, asi que no
   cambian de foto al recargar la pagina.

   Mientras no haya fotos propias de cada tour, la galeria se
   queda en MAX_SLIDES para que no se repita tanto la misma foto.

   ¿Ya tienes las fotos reales de una excursion? Cambia el arreglo
   a mano:  media: [{t:'img', s:'images/buggies-1.jpg'}, ...]
   El slide de video queda de segundo, igual que antes.
   ──────────────────────────────────────────────────────────── */
const MAX_SLIDES = 7;

function M(id, nFotos, nVideos){
  const conVideo = nVideos > 0 ? 1 : 0;          // no hay .mp4 todavia: 1 solo slide de video
  const fotos = Math.min(nFotos, MAX_SLIDES - conVideo);
  const out = [];
  for(let i=1;i<=fotos;i++) out.push({ t:'img', s: pickFoto(id + i) });
  if(conVideo) out.splice(1, 0, { t:'vid', s:'', p: pickFoto(id + 'v') });
  return out;
}
const EXCURSIONES = [

  /* ══════════ PUNTA CANA ══════════ */
  {
    id:'buggies-dia', dest:'punta-cana', name:'Buggies por el Día',
    time:'3 h', tag:'top', tagText:'El más vendido', rating:'4.8', reviews:264,
    zona:'Punta Cana · Macao', viajeros:3200, nivel:'Extremo', idiomas:'Español · Inglés',
    hook:'Sales limpio a las 8:00 y vuelves cubierto de lodo. Cueva taína y playa Macao de por medio.',
    media: M('buggies-dia', 15, 2),
    salidas:['8:00 AM','2:00 PM'],
    incluye:['Buggy doble o individual','Casco, gafas y pañuelo','Parada en cueva y playa Macao','Te recojo en tu hotel o en tu parada de la zona','Guía bilingüe'],
    llevar:['Ropa que se pueda ensuciar','Muda seca','Efectivo para propinas'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 20'],['kid','Apto desde los 8 años']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:65, abono:13
  },
  {
    id:'buggies-noche', dest:'punta-cana', name:'Buggies Nocturnos',
    time:'3 h', tag:'hot', tagText:'Casi agotado', rating:'4.9', reviews:118,
    zona:'Punta Cana · Macao', viajeros:940, nivel:'Extremo', idiomas:'Español · Inglés',
    hook:'La misma ruta, pero de noche: luces LED, la música puesta y una fogata para cerrar.',
    media: M('buggies-noche', 15, 2),
    salidas:['5:30 PM','7:00 PM'],
    incluye:['Buggy con luces LED','Casco, gafas y pañuelo','Fogata y bebida al cierre','Te recojo en tu hotel o en tu parada de la zona','Guía bilingüe'],
    llevar:['Ropa que se pueda ensuciar','Suéter ligero','Muda seca'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 16'],['kid','Apto desde los 12 años']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:70, abono:14
  },
  {
    id:'hacienda-park', dest:'punta-cana', name:'Hacienda Park',
    time:'5 h', tag:null, tagText:'', rating:'4.8', reviews:176,
    zona:'Punta Cana', viajeros:2100, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Tirolesa, caballo, cenote y almuerzo típico. Todo dentro de la misma finca, sin montarte otra vez a la guagua.',
    media: M('hacienda-park', 16, 2),
    salidas:['8:30 AM','1:00 PM'],
    incluye:['Entrada al parque','Circuito de tirolesas','Cabalgata y baño en cenote','Almuerzo típico','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Toalla','Zapatos cerrados'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 30'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:89, abono:18
  },
  {
    id:'el-dorado-park', dest:'punta-cana', name:'El Dorado Park',
    time:'6 h', tag:null, tagText:'', rating:'4.7', reviews:132,
    zona:'Punta Cana', viajeros:1500, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Buggy, tirolesa, cenote y show cultural. Seis horas, un solo parque, todo ya pagado.',
    media: M('el-dorado-park', 15, 2),
    salidas:['8:30 AM','1:30 PM'],
    incluye:['Todas las atracciones del parque','Almuerzo buffet','Bebidas nacionales','Te recojo en tu hotel o en tu parada de la zona','Guía bilingüe'],
    llevar:['Traje de baño','Toalla','Protector solar'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 35'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:95, abono:19
  },
  {
    id:'four-wheel', dest:'punta-cana', name:'Four Wheel',
    time:'3 h', tag:null, tagText:'', rating:'4.7', reviews:88,
    zona:'Punta Cana', viajeros:1100, nivel:'Extremo', idiomas:'Español · Inglés',
    hook:'Aquí manejas tú. Camino de tierra, palmares y playa al final del recorrido.',
    media: M('four-wheel', 15, 1),
    salidas:['9:00 AM','2:00 PM'],
    incluye:['Cuatrimoto individual o doble','Casco y gafas','Instructor certificado','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Ropa que se pueda ensuciar','Pañuelo','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 18'],['kid','Apto desde los 10 años']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:75, abono:15
  },
  {
    id:'party-boat', dest:'punta-cana', name:'Party Boat',
    time:'3.5 h', tag:'hot', tagText:'Casi agotado', rating:'4.8', reviews:205,
    zona:'Punta Cana · Bávaro', viajeros:2600, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'DJ, barra libre y una parada donde el mar te da por la cintura y todo el mundo se baja.',
    media: M('party-boat', 16, 2),
    salidas:['10:00 AM','2:30 PM'],
    incluye:['Barra libre nacional','DJ y animación','Equipo de snorkel','Te recojo en tu hotel o en tu parada de la zona','Guía bilingüe'],
    llevar:['Traje de baño','Muda seca','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 45'],['kid','Solo adultos','no']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:79, abono:16
  },
  {
    id:'coco-bongo', dest:'punta-cana', name:'Coco Bongo',
    time:'5 h', tag:'top', tagText:'El más vendido', rating:'4.9', reviews:240,
    zona:'Punta Cana', viajeros:3400, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Acróbatas colgando del techo, tributos en vivo y barra libre hasta que cierran.',
    media: M('coco-bongo', 15, 2),
    salidas:['9:30 PM'],
    incluye:['Entrada VIP al show','Barra libre nacional','Transporte ida y vuelta','Asistencia en el lugar'],
    llevar:['Ropa de salida','Identificación','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 40'],['kid','Solo mayores de 18','no']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:99, abono:20
  },
  {
    id:'scape-park', dest:'punta-cana', name:'Scape Park',
    time:'6 h', tag:null, tagText:'', rating:'4.9', reviews:198,
    zona:'Cap Cana', viajeros:2900, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Te tiras al Hoyo Azul, el cenote turquesa de Cap Cana. Después, tirolesas y cuevas.',
    media: M('scape-park', 16, 2),
    salidas:['8:00 AM','12:30 PM'],
    incluye:['Entrada a Scape Park','Hoyo Azul y cenotes','Tirolesas y cuevas','Almuerzo y bebidas','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Toalla','Zapatos cerrados'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 25'],['kid','Apto desde los 6 años']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:119, abono:24
  },
  {
    id:'delfines', dest:'punta-cana', name:'Nado con Delfines',
    time:'4 h', tag:null, tagText:'', rating:'4.8', reviews:154,
    zona:'Punta Cana · Bávaro', viajeros:2200, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Un delfín te empuja por los pies hasta sacarte del agua. Con entrenador certificado al lado.',
    media: M('delfines', 15, 2),
    salidas:['9:00 AM','1:00 PM'],
    incluye:['Encuentro con delfines','Entrenador certificado','Chaleco salvavidas','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Toalla','Efectivo para las fotos'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos pequeños de hasta 10'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:145, abono:29
  },
  {
    id:'caribbean-lake-park', dest:'punta-cana', name:'Caribbean Lake Park',
    time:'5 h', tag:null, tagText:'', rating:'4.7', reviews:96,
    zona:'Punta Cana', viajeros:820, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Wakeboard, kayak e inflables en un lago. A los muchachos hay que sacarlos a la fuerza.',
    media: M('caribbean-lake-park', 15, 1),
    salidas:['9:00 AM','1:30 PM'],
    incluye:['Acceso a todas las atracciones','Equipo y chaleco','Almuerzo','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Toalla','Protector solar'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 30'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:85, abono:17
  },
  {
    id:'higuey-city-tour', dest:'punta-cana', name:'Higüey City Tour',
    time:'4 h · 8 h', tag:null, tagText:'', rating:'4.6', reviews:64,
    zona:'Higüey', viajeros:540, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'La Basílica, el mercado y un colmado de barrio. El país que no sale en el folleto del hotel.',
    media: M('higuey-city-tour', 15, 1),
    salidas:['8:00 AM (día completo)','1:00 PM (medio día)'],
    incluye:['Transporte con aire acondicionado','Guía local','Visita a la Basílica','Mercado y colmado típico'],
    llevar:['Zapatos cómodos','Gorra','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 16'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 24h antes. Sin preguntas.', price:55, abono:11
  },

  /* ══════════ BAYAHIBE / LA ROMANA ══════════ */
  {
    id:'saona', dest:'bayahibe', name:'Isla Saona',
    time:'10 h', tag:'top', tagText:'El más vendido', rating:'4.9', reviews:412,
    zona:'Bayahibe · Isla Saona', viajeros:5200, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Catamarán, piscina natural en medio del mar y la playa que sale en todas las postales.',
    media: M('saona', 18, 3),
    salidas:['7:00 AM'],
    incluye:['Catamarán y lancha rápida','Parada en la piscina natural','Almuerzo buffet en la playa','Barra libre nacional','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Protector solar','Toalla','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 45'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:89, abono:18
  },
  {
    id:'isla-catalina', dest:'bayahibe', name:'Isla Catalina',
    time:'9 h', tag:null, tagText:'', rating:'4.8', reviews:148,
    zona:'La Romana · Isla Catalina', viajeros:1700, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Metes la cara al agua y ves el arrecife. Una isla sin gente encima.',
    media: M('isla-catalina', 16, 2),
    salidas:['7:00 AM'],
    incluye:['Transporte en catamarán','Equipo de snorkel','Almuerzo buffet','Barra libre nacional','Guía bilingüe'],
    llevar:['Traje de baño','Protector solar biodegradable','Toalla'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 40'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:99, abono:20
  },
  {
    id:'buceo-bayahibe', dest:'bayahibe', name:'Buceo en Bayahibe',
    time:'5 h', tag:null, tagText:'', rating:'4.9', reviews:72,
    zona:'Bayahibe', viajeros:480, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Dos inmersiones con instructor PADI. Da igual que nunca te hayas puesto un tanque.',
    media: M('buceo-bayahibe', 15, 2),
    salidas:['8:00 AM','1:00 PM'],
    incluye:['Equipo completo de buceo','Instructor PADI','Dos inmersiones','Bebidas y refrigerio','Traslado desde tu hotel o parada de la zona'],
    llevar:['Traje de baño','Toalla','Tu certificación si la tienes'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos pequeños de hasta 8'],['kid','Desde 10 años con instructor']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:125, abono:25
  },

  /* ══════════ SAMANÁ ══════════ */
  {
    id:'samana', dest:'samana', name:'Samaná: Cayo Levantado y Salto El Limón',
    time:'12 h', tag:null, tagText:'', rating:'4.9', reviews:186,
    zona:'Samaná', viajeros:1400, nivel:'Activo', idiomas:'Español · Inglés',
    hook:'Cayo Levantado por la mañana. Por la tarde, 40 metros de cascada cayéndote encima.',
    media: M('samana', 18, 2),
    salidas:['5:30 AM'],
    incluye:['Transporte y ferry','Cayo Levantado con almuerzo','Cabalgata al Salto El Limón','Guía bilingüe','Te recojo en tu hotel o en tu parada de la zona'],
    llevar:['Traje de baño','Zapatos que se puedan mojar','Muda seca','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 20'],['kid','Apto desde los 6 años']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:139, abono:28
  },

  /* ══════════ SANTO DOMINGO ══════════ */
  {
    id:'santo-domingo-full-day', dest:'santo-domingo', name:'Santo Domingo Full Day',
    time:'12 h', tag:'top', tagText:'El más vendido', rating:'4.7', reviews:124,
    zona:'Santo Domingo', viajeros:980, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Caminas por la primera calle empedrada de América, con un guía historiador que sabe de qué habla.',
    media: M('santo-domingo-full-day', 16, 2),
    salidas:['6:00 AM'],
    incluye:['Transporte con aire acondicionado','Guía historiador','Entradas a los museos','Almuerzo','Tiempo para compras'],
    llevar:['Zapatos cómodos','Gorra','Cámara','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 20'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:105, abono:21
  },
  {
    id:'tour-point-full-day', dest:'santo-domingo', name:'Tour Point Full Day',
    time:'11 h', tag:null, tagText:'', rating:'4.6', reviews:58,
    zona:'Santo Domingo', viajeros:420, nivel:'Relajado', idiomas:'Español · Inglés',
    hook:'Ciudad, playa y los cuatro puntos donde todo el mundo saca la misma foto. En un día.',
    media: M('tour-point-full-day', 15, 1),
    salidas:['6:30 AM'],
    incluye:['Transporte privado','Guía bilingüe','Paradas fotográficas','Almuerzo','Agua y refrigerio'],
    llevar:['Zapatos cómodos','Cámara','Efectivo'],
    facts:[['van','Te recojo en tu hotel o en tu parada de la zona'],['users','Grupos de hasta 16'],['kid','Apto para todas las edades']],
    cancela:'Cancelas gratis hasta 48h antes. Sin preguntas.', price:115, abono:23
  },
];

/* ============================================================
   EXTRAS — lo que se le puede anadir a CUALQUIER reserva

   Sirven igual para una excursion de un dia que para un paquete
   de varios: son ingresos aparte. Si el cliente quiere un
   bizcocho, lo quiere lo mismo yendo a Saona que yendo a Samana.

   Cada extra tiene "grupos" de opciones. Tipos de grupo:
     'precio'  -> opciones que DEFINEN el precio (elige una)
     'opcion'  -> elige una, no cambia precio (ej. sabor)
     'suma'    -> opciones que SUMAN al precio (una o varias)
     'cantidad'-> multiplica el precio por N
     'texto'   -> campo de texto libre (mensaje)
   El precio final = (precio base elegido + sumas) x cantidad
   ============================================================ */
const EXTRAS = [
  {
    id:'bizcocho', emoji:'🎂', name:'Bizcocho de cumpleaños', desc:'Personalízalo a tu gusto',
    groups:[
      { key:'tam', label:'Tamaño', type:'precio', opts:[
        {v:'Para 4-6 personas', price:25},{v:'Para 8-10 personas', price:40},{v:'Para 15-20 personas', price:65} ]},
      { key:'sabor', label:'Sabor', type:'opcion', opts:[
        {v:'Chocolate'},{v:'Vainilla'},{v:'Tres leches'},{v:'Red velvet'} ]},
      { key:'msg', label:'Mensaje en el bizcocho', type:'texto', ph:'Ej: ¡Feliz cumple, María!' },
    ]
  },
  {
    id:'champan', emoji:'🍾', name:'Champán y vinos', desc:'Para brindar a bordo',
    groups:[
      { key:'tipo', label:'¿Cuál prefieres?', type:'precio', opts:[
        {v:'Prosecco', price:30},{v:'Champán francés', price:75},{v:'Vino tinto/blanco', price:35} ]},
      { key:'cant', label:'¿Cuántas botellas?', type:'cantidad' },
    ]
  },
  {
    id:'romantico', emoji:'💐', name:'Decoración romántica', desc:'Sorprende a tu pareja',
    groups:[
      { key:'pack', label:'Elige el paquete', type:'precio', opts:[
        {v:'Sencillo (flores + globos)', price:45},{v:'Completo (+ mesa decorada)', price:90},{v:'Pedida de mano 💍', price:180} ]},
    ]
  },
  {
    id:'langosta', emoji:'🦞', name:'Almuerzo premium', desc:'Sube de nivel la comida',
    groups:[
      { key:'plato', label:'Elige el plato', type:'precio', opts:[
        {v:'Langosta a la parrilla', price:35},{v:'Camarones al ajillo', price:28},{v:'Parrillada mixta', price:32} ]},
      { key:'pers', label:'¿Para cuántas personas?', type:'cantidad' },
    ]
  },
  {
    id:'fotos', emoji:'📸', name:'Fotos y video profesional', desc:'Llévate los recuerdos',
    groups:[
      { key:'pack', label:'Elige el paquete', type:'precio', opts:[
        {v:'Digital básico (30 fotos)', price:40},{v:'Premium editado (100 fotos + video)', price:75},{v:'Con dron 🚁', price:120} ]},
    ]
  },
  {
    id:'masaje', emoji:'💆', name:'Masaje en la playa', desc:'Puro relax frente al mar',
    groups:[
      { key:'dur', label:'Duración', type:'precio', opts:[
        {v:'20 minutos', price:30},{v:'40 minutos', price:50} ]},
      { key:'pers', label:'¿Para cuántas personas?', type:'cantidad' },
    ]
  },
  {
    id:'vip', emoji:'🚐', name:'Transporte privado VIP', desc:'Solo para tu grupo',
    groups:[
      { key:'veh', label:'Según tu grupo', type:'precio', opts:[
        {v:'Van (hasta 6)', price:70},{v:'Van grande (hasta 12)', price:110},{v:'Bus privado (hasta 25)', price:180} ]},
    ]
  },
  {
    id:'kit', emoji:'🎁', name:'Kit de bienvenida', desc:'Toalla + gorra de recuerdo',
    groups:[
      { key:'cant', label:'¿Cuántos kits?', type:'cantidad', unit:25 },
    ]
  },
];

/* ============================================================
   EL WHATSAPP DE IVONNE
   Un solo sitio. Cambialo aqui y cambia en toda la web.
   Formato: pais + numero, sin signos. Ej: 18091234567
   ============================================================ */
const WHATSAPP = '1809XXXXXXX';

/* ============================================================
   BUSCAR LO QUE EL CLIENTE ELIGIO

   La pagina de reserva recibe por la direccion quien es:
     reservar.html?tipo=excursion&id=saona
     reservar.html?tipo=paquete&id=tour-del-sur

   Devuelve la excursion o el paquete, o null si ese id no
   existe (por ejemplo, un enlace viejo que quedo por ahi).
   ============================================================ */
function buscarProducto(tipo, id){
  if(!id) return null;
  const lista = (tipo === 'paquete') ? TOURS : EXCURSIONES;
  return lista.find(t => t.id === id) || null;
}
