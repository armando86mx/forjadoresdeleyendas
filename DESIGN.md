# Design

Sistema visual vigente del sitio (capturado del código; fuente de verdad: `src/styles/global.css` + componentes).

## Theme

Taberna/posada de fantasía medieval, cálida y sobria. Luz de vela sobre madera y pergamino. La inmersión la dan ilustraciones painterly, paleta y voz — nunca efectos kitsch. Identidad ya comprometida y en producción: los cambios de pulido la refinan, no la reemplazan.

## Color

Tokens en `@theme` (Tailwind 4), hex:

| Token | Valor | Uso |
|---|---|---|
| `--color-parchment` | `#f3e3cb` | Fondo body / secciones alternas |
| `--color-parchment-light` | `#faf3e3` | Superficies elevadas / secciones alternas |
| `--color-wood` | `#5c4020` | Headings sobre claro |
| `--color-ink` | `#2b1f14` | Texto cuerpo; fondos oscuros (header/footer/CTA final) |
| `--color-amber` | `#e8a33d` | Acento cálido (hover, títulos sobre oscuro) |
| `--color-fire` | `#a64f22` | CTA primario / acentos (AA verificado sobre parchment) |
| `--color-shield` | `#6b7a54` | Verde del escudo (reservado, casi sin uso) |

Estrategia: Committed — el pergamino/madera carga la identidad; fire es el único acento de acción. Nota: la paleta parchment es una elección de registro literal (posada medieval = pergamino real), no el default IA; se preserva por identidad.

## Typography

- **Display**: Cinzel 400/700 (`--font-display`) — títulos, botones, marca. Solo títulos; nunca cuerpo.
- **Body**: Inter Variable (`--font-body`).
- Self-hosted vía @fontsource. H1 hero: `text-4xl sm:text-6xl`. Eyebrows: sistema de kicker de marca en `SectionTitle.astro` (deliberado, no scaffolding).

## Components

- `WhatsAppButton.astro` — CTA canónico: props `{message, label, variant: 'primary'|'outline'}`; primary `bg-fire text-parchment-light`, hover `bg-amber text-ink`; focus ring amber.
- `SectionTitle.astro` — eyebrow (`text-wood`, uppercase tracked) + H2 display.
- `Header.astro` — sticky `bg-ink/95 backdrop-blur`, escudo + nombre en Cinzel, nav 5 items (wrap en móvil, touch targets ≥44px).
- `Footer.astro` — 3 columnas sobre `bg-ink`: marca, La Posada (dirección/WhatsApp/enlaces internos), redes.
- Tarjetas de contenido: `rounded-lg bg-parchment-light shadow-sm` sobre parchment (o `bg-parchment border-wood/20` sobre parchment-light).

## Layout

- Contenedor `max-w-6xl mx-auto px-4`, secciones `py-16`, fondos alternando parchment/parchment-light; secciones de énfasis en ink.
- Hero: imagen full-bleed con overlay `bg-ink/60`, contenido centrado, `min-h-[85vh]`.
- Grids: `sm:grid-cols-2 lg:grid-cols-4` en tarjetas.

## Motion

- Transiciones de color en interactivos (`transition-colors`).
- Regla del proyecto: ease-out, sin bounce; `prefers-reduced-motion: reduce` obligatorio en toda animación nueva; nunca ocultar contenido detrás de animaciones de scroll (lección del sitio WordPress anterior, que mostraba secciones en blanco).

## Imagery

6 ilustraciones painterly coherentes (Gemini/Nano Banana) en `src/assets/img/`: luz ámbar, tonos café/pergamino, sin texto incrustado. Alt descriptivo en es-MX con contexto local. Vía `<Image>` de astro:assets; hero con `loading="eager" fetchpriority="high"`.
