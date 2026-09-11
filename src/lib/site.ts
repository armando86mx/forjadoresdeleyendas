export const SITE = {
  name: 'Forjadores de Leyendas',
  url: 'https://forjadoresdeleyendas.mx',
  description:
    'Comunidad de juegos de rol: partidas abiertas de Dungeons & Dragons y más sistemas en las mazmorras de Puebla, Ciudad de México y Guadalajara. Regístrate y llega a jugar.',
  phone: '+52 222 189 0232',
  whatsapp: '522221890232',
  address: {
    street: 'C. 12 Sur 908-1',
    neighborhood: 'Barrio de Analco',
    city: 'Puebla',
    state: 'Puebla',
    zip: '72500',
    country: 'MX',
  },
  social: {
    x: 'https://x.com/Forjadleyendas',
    youtube: 'https://www.youtube.com/@ForjadoresdeLeyendas',
    instagram: 'https://www.instagram.com/forjadoresdeleyendas/',
    tiktok: 'https://www.tiktok.com/@forjadoresdeleyendas_',
    twitch: 'https://www.twitch.tv/forjadoresdeleyendas',
  },
};

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
