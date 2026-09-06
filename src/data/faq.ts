// Depurada en 2026-11: se retiraron las preguntas de costos, métodos de pago,
// penalizaciones, descuentos y alimentos mientras esos servicios están en pausa.
// El historial de git conserva las respuestas originales por si vuelven.
export const FAQ = [
  {
    categoria: 'Sesiones',
    items: [
      { destacada: true, q: '¿Puedo unirme si nunca he jugado rol?', a: '¡Claro! Nuestros Guardianes de Historias te guían desde la primera tirada. No necesitas saber nada antes de llegar: las reglas se aprenden jugando.' },
      { q: '¿Qué incluye la sesión?', a: 'Un Guardián de Historias (Dungeon Master) experto, escenografía digital e interactiva, y acceso a dados, miniaturas y accesorios de juego. Tú solo trae a tu grupo y tus ganas de aventura.' },
      { q: '¿Cuántas personas pueden participar?', a: 'Las sesiones son para grupos de 3 a 6 aventureros. ¿Son más? Escríbenos: coordinamos mesas y horarios para grupos grandes y eventos.' },
      { q: '¿Se pueden personalizar las experiencias de rol?', a: '¡Sí! Si tienes una idea para una historia especial, la diseñamos a la medida de tu grupo.' },
    ],
  },
  {
    categoria: 'Reservaciones',
    items: [
      { q: '¿Cómo puedo reservar una sesión?', a: 'Escríbenos por WhatsApp o por cualquiera de nuestras redes sociales y un Guardián te ayudará a elegir fecha y aventura.' },
      { q: '¿Con cuánto tiempo debo reservar?', a: 'Con al menos 48 horas de anticipación: así preparamos y diseñamos el one-shot a la medida de tu grupo.' },
      { q: '¿Puedo cambiar la fecha de mi sesión?', a: 'Sí. Avísanos con al menos 72 horas de anticipación y reacomodamos tu aventura sin problema.' },
      { q: '¿Puedo reservar solo el espacio sin una sesión?', a: 'Sí, coordinándolo con un Guardián de Historias de mayor rango. Escríbenos y lo armamos.' },
    ],
  },
  {
    categoria: 'Contacto',
    items: [
      { destacada: true, q: '¿Organizan team building para empresas?', a: 'Sí. Armamos sesiones de rol pensadas para equipos de trabajo, con dinámicas de aventura que sueltan a cualquier grupo. Cotiza tu evento por WhatsApp y arma la campaña de tu empresa.' },
      { q: '¿Cuáles son los canales de comunicación?', a: 'WhatsApp y nuestras redes sociales (Instagram, X, YouTube, TikTok y Twitch). Respondemos lo más rápido posible.' },
      { q: '¿Tienen eventos especiales?', a: 'Sí: noches temáticas, sesiones especiales y colaboraciones con creadores geek. Anunciamos todo en redes y en nuestras Crónicas.' },
    ],
  },
];

export const DESTACADAS = FAQ.flatMap((c) => c.items).filter((i) => 'destacada' in i && i.destacada);
