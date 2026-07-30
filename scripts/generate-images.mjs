import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.env.GEMINI_API_KEY ?? readFileSync('.env', 'utf8').match(/^GEMINI_API_KEY=(.+)$/m)?.[1];
if (!KEY) throw new Error('GEMINI_API_KEY no configurada');

const STYLE =
  'Warm digital fantasy illustration, painterly, cozy medieval tavern aesthetic, amber candlelight, rich browns and parchment tones, high detail, no text, no watermark, no people looking at camera';

const IMAGES = [
  ['hero-taberna', `Interior of a cozy medieval fantasy tavern prepared for a tabletop role-playing session: long wooden table with dice, maps and miniatures, lanterns and candles, shelves with books and potions. ${STYLE}. Wide 16:9 composition.`],
  ['guardian', `Charismatic fantasy innkeeper-storyteller behind a game master screen, gesturing dramatically while telling a story, warm candlelight, players' silhouettes in foreground. ${STYLE}.`],
  ['mesa-juego', `Close-up of a tabletop RPG table: a hand rolling a glowing d20 die, character sheets, painted miniatures on a battle map, mugs of drink. ${STYLE}.`],
  ['banquete', `Rustic fantasy tavern feast on a wooden table: hearty burgers, sausages, golden fries, mugs of honey mead, roasted chicken wings, medieval presentation. ${STYLE}.`],
  ['escenografia', `Immersive game room with digital screen showing a fantasy map, themed medieval decoration, controlled ambient lighting, table set for adventurers. ${STYLE}.`],
  ['novatos', `Group of diverse young friends laughing around a tabletop RPG table, welcoming atmosphere, one of them rolling dice for the first time, warm tavern light. ${STYLE}.`],
];

const MODELS = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];

async function generate(name, prompt) {
  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) { console.warn(`${model} → HTTP ${res.status}, probando siguiente`); continue; }
    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) { console.warn(`${model} → sin imagen, probando siguiente`); continue; }
    writeFileSync(`src/assets/img/${name}.jpg`, Buffer.from(part.inlineData.data, 'base64'));
    console.log(`✔ ${name} (${model})`);
    return;
  }
  throw new Error(`No se pudo generar ${name}`);
}

mkdirSync('src/assets/img', { recursive: true });
for (const [name, prompt] of IMAGES) await generate(name, prompt);
