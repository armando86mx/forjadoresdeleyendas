export const FAQ = [
  {
    categoria: 'Sesiones y precios',
    items: [
      { destacada: true, q: '¿Puedo unirme si nunca he jugado rol?', a: '¡Claro! Nuestros Guardianes de Historias te guían desde la primera tirada. No necesitas saber nada antes de llegar: las reglas se aprenden jugando.' },
      { destacada: true, q: '¿Cuánto cuesta una sesión de rol?', a: 'Una sesión suelta (one-shot) cuesta entre $300 y $500 MXN por persona e incluye Guardián de Historias, ambientación, comida y bebida. También tenemos paquetes de campaña: corta de 4 sesiones por $1,800 MXN, media de 6 sesiones por $2,400 MXN y larga de 10 sesiones por $3,500 MXN por persona.' },
      { q: '¿Qué incluye la sesión?', a: 'Un Guardián de Historias (Dungeon Master) experto, escenografía digital e interactiva, comida y bebida, y acceso a dados, miniaturas y accesorios de juego. Tú solo trae a tu grupo y tus ganas de aventura.' },
      { q: '¿Cuántas personas pueden participar?', a: 'Las sesiones son para grupos de 3 a 6 aventureros. ¿Son más? Escríbenos: coordinamos mesas y horarios para grupos grandes y eventos.' },
    ],
  },
  {
    categoria: 'Reservaciones y pagos',
    items: [
      { q: '¿Cómo puedo reservar una sesión?', a: 'Escríbenos por WhatsApp o por cualquiera de nuestras redes sociales y un Guardián te ayudará a elegir fecha y aventura.' },
      { q: '¿Con cuánto tiempo debo reservar?', a: 'Con al menos 48 horas de anticipación: preparamos los alimentos con productos frescos y diseñamos el one-shot para tu grupo.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Efectivo, tarjetas de crédito o débito, transferencias bancarias y PayPal.' },
      { q: '¿Puedo cambiar la fecha de mi sesión?', a: 'Sí, sin penalización si nos avisas con al menos 72 horas de anticipación.' },
      { q: '¿Cuál es la política de cancelaciones?', a: 'Cancelando con 72 horas de anticipación no hay penalización. Con menos de 72 horas, la penalización es de $250 MXN por persona.' },
      { q: '¿Tienen descuentos o membresías?', a: 'Por ahora no manejamos membresías, pero lanzamos promociones por temporada. Síguenos en redes para enterarte primero.' },
      { q: '¿Puedo reservar solo la sesión sin comida?', a: 'Sí. Déjanos tus datos y un Guardián de Historias de mayor rango coordinará los detalles contigo.' },
      { q: '¿Puedo reservar solo el espacio sin una sesión?', a: 'Sí, coordinándolo con un Guardián de Historias de mayor rango. Escríbenos y lo armamos.' },
    ],
  },
  {
    categoria: 'Extras y productos',
    items: [
      { q: '¿Qué productos adicionales venden?', a: 'Miniaturas 3D personalizadas ($250 – $500 MXN), dibujo épico de tu party ($500 – $3,500 MXN) y cosplay por pedido con precio según diseño.' },
      { q: '¿Se pueden personalizar las experiencias de rol?', a: '¡Sí! Si tienes una idea para una historia especial, la diseñamos a la medida de tu grupo.' },
      { q: '¿Los alimentos y bebidas están incluidos?', a: 'Sí, cada sesión incluye comida y bebida. También puedes pedir extras del menú de la posada.' },
    ],
  },
  {
    categoria: 'Contacto',
    items: [
      { destacada: true, q: '¿Organizan team building para empresas?', a: 'Sí. Armamos sesiones de rol pensadas para equipos de trabajo, con dinámicas de aventura que sueltan a cualquier grupo y comida incluida. Cotiza tu evento por WhatsApp y arma la campaña de tu empresa.' },
      { q: '¿Cuáles son los canales de comunicación?', a: 'WhatsApp y nuestras redes sociales (Instagram, X, YouTube, TikTok y Twitch). Respondemos lo más rápido posible.' },
      { q: '¿Tienen eventos especiales?', a: 'Sí: noches temáticas, sesiones especiales y colaboraciones con creadores geek. Anunciamos todo en redes y en nuestras Crónicas.' },
      { q: '¿Tienen programa de referidos?', a: 'Estamos forjando uno: si traes a un amigo, ambos obtendrán 10% de descuento en su próxima sesión. Pregunta por WhatsApp si ya está activo.' },
    ],
  },
];

export const DESTACADAS = FAQ.flatMap((c) => c.items).filter((i) => 'destacada' in i && i.destacada);
