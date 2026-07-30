export const SITE = {
  name: 'Forjadores de Leyendas',
  url: 'https://forjadoresdeleyendas.mx',
  description:
    'Posada temática en Puebla para jugar Dungeons & Dragons y rol en vivo: Guardián de Historias, comida temática y escenografía inmersiva.',
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
