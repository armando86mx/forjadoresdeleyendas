# Estado del sitio — Forjadores de Leyendas

Documento de handoff. Última actualización: **2026-11**, commit `546158f`.
Sitio **en producción** en https://forjadoresdeleyendas.mx (verificado en vivo).

---

## 1. Qué es esto

Sitio de marketing de **Forjadores de Leyendas**: posada temática de fantasía medieval en el
Barrio de Analco, Puebla, donde se juegan sesiones privadas de Dungeons & Dragons y otros
juegos de rol, dirigidas por "Guardianes de Historias".

- **Dueño del negocio:** Ernesto, alias **Pollo** (amigo de Armando).
- **Objetivo del sitio:** que el visitante escriba por **WhatsApp** para reservar. No hay
  carrito, formularios ni cuentas: toda la conversión es un enlace `wa.me` con mensaje precargado.
- **Reemplazó** a un WordPress + Elementor anterior, que fue eliminado por completo del servidor.

Contexto estratégico completo en [`PRODUCT.md`](../PRODUCT.md) (usuarios, personas, principios,
anti-referencias) y sistema visual en [`DESIGN.md`](../DESIGN.md).

## 2. Stack y arquitectura

| Pieza | Detalle |
|---|---|
| Framework | **Astro 5** (100% estático, cero JS de hidratación) |
| Estilos | **Tailwind CSS 4** vía `@tailwindcss/vite` (sin archivo `tailwind.config`) |
| Tipografía | Cinzel (títulos) + Inter Variable (cuerpo), self-hosted con `@fontsource` |
| Imágenes | `astro:assets` + `sharp`; ilustraciones generadas con Gemini (Nano Banana) |
| Contenido | Content collections en Markdown (`src/content/cronicas/`) |
| Alias | `@/*` → `src/*` |

### Estructura relevante

```
src/
  pages/          index.astro · faq.astro · cronicas/index.astro · cronicas/[slug].astro · 404.astro
  layouts/        BaseLayout.astro        (metas, OG, canonical, noindex opcional, Analytics)
  components/     Header · Footer · WhatsAppButton · SectionTitle · FloatingWhatsApp · Analytics
  data/           precios.ts · menu.ts · faq.ts     (contenido estructurado, editable sin tocar JSX)
  lib/site.ts     SITE (nombre, URL, teléfono, dirección, redes) + waLink()
  styles/         global.css  (tokens @theme, capas base/components, .card, .card-lift, .ornament)
  content/cronicas/   2 entradas en Markdown
public/           .htaccess · robots.txt · favicon.svg · og-default.jpg · <indexnow-key>.txt
docs/superpowers/ spec y plan originales del proyecto
```

## 3. Despliegue (importante)

```
rama main (fuente)  →  GitHub Action  →  rama hostinger-deploy (sitio compilado)  →  Hostinger
```

- Repo: `https://github.com/armando86mx/forjadoresdeleyendas` (público).
- El workflow `.github/workflows/deploy.yml` compila en cada push a `main` y publica `dist/`
  en la rama **`hostinger-deploy`**. Acciones ancladas a SHA; permisos mínimos.
- **Hostinger NO jala solo.** Armando entra a hPanel → Avanzado → GIT → **Desplegar** después
  de cada publicación. El webhook de despliegue automático sigue pendiente de configurar.
- ⚠️ **Nunca reintroducir `force_orphan`** en el workflow: reescribe la historia de la rama y
  rompe el `git pull` de Hostinger ("divergent branches"), lo que obliga a un reset manual completo.
- ⚠️ Un push que toque `.github/workflows/*` puede ser rechazado por HTTPS si el PAT no tiene
  scope `workflow`; en ese caso empujar por SSH.

## 4. Estado del contenido (2026-11)

**Servicios en pausa:** hoy la posada **no ofrece alimentos ni cobra por sesión**.
Decisión explícita de Armando: **no escribir en ningún lado que sea gratuito**, solo ocultar.

| Elemento | Estado | Cómo se revierte |
|---|---|---|
| Sección **Precios** ("tablón de la posada") | Oculta | `MOSTRAR_PRECIOS = true` en `src/pages/index.astro` |
| Sección **El Banquete** (carta de comida) | Oculta | `MOSTRAR_BANQUETE = true` en el mismo archivo |
| **FAQ** en el menú y el footer | Retirada | volver a agregar en `Header.astro` / `Footer.astro` |
| **FAQ** en buscadores | `noindex, follow` + fuera del sitemap | quitar `noindex` en `faq.astro` y el `filter` en `astro.config.mjs` |
| Datos de `precios.ts` y `menu.ts` | Intactos en el repo | se usan solo dentro de los bloques con flag |

Al reactivar los flags hay que **revisar también** lo que se limpió en paralelo: el hero,
`SITE.description`, la tarjeta "Banquete incluido" de *Qué incluye tu sesión* (el grid está en
3 columnas), un bullet de team building, y el JSON-LD (perdió `FoodEstablishment`,
`servesCuisine`, `priceRange` y `hasMenu`).

**La FAQ fue depurada**: quedaron 11 preguntas sobre sesiones, reservaciones y contacto.
Se retiraron las de costos, métodos de pago, penalización por cancelación, descuentos y
alimentos. Las respuestas originales están en el historial de git.

**El blog conserva** sus menciones de comida por decisión de Armando: son relatos fechados,
no promesas de servicio vigente.

### Secciones vivas de la home, en orden

Hero → "¿Nunca has jugado rol?" (3 pasos) → "Qué incluye tu sesión" (3 tarjetas) →
"Forja un equipo de leyenda" (team building) → Ubicación con mapa → CTA final.

## 5. Medición, SEO y seguridad

- **Google Analytics 4:** `G-K77Y23Q30L` · **Microsoft Clarity:** `xugemald3n`.
  Se inyectan solo si hay ID; en local viven en `.env` (gitignored) y en producción en las
  **Variables** del repo de GitHub (Settings → Secrets and variables → Actions → **Variables**),
  **no** en Secrets.
- **IndexNow:** clave `5421e1be952874a0c0c5c3bdf60bc77d`, con ping automático en el workflow.
- **Sitemap:** 4 URLs (home + índice de crónicas + 2 entradas). La FAQ está excluida a propósito.
- **`public/.htaccess`:** 404 propia, redirect `www` → apex, bloqueo de `/.git`, headers de
  seguridad (nosniff, X-Frame-Options, Referrer-Policy, HSTS, Permissions-Policy) y caché
  (HTML `no-cache`, `/_astro/` inmutable un año).
- **Auditorías (última corrida, sitio ya en vivo):** seguridad **riesgo bajo**, SEO **8/10**,
  diseño **26/36**. Snapshots de las críticas de diseño en `.impeccable/critique/`.

## 6. Pendientes

**De Armando (accesos y datos que solo él tiene):**
- Webhook de despliegue automático en Hostinger, para dejar de presionar "Desplegar".
- Alta en **Google Search Console** y creación del **Perfil de Negocio de Google** (lo de mayor
  impacto para SEO local que falta); luego Bing Webmaster importa desde Search Console.
- Coordenadas geográficas del local, para completar el JSON-LD.

**De Pollo (datos del negocio):**
- **Horario** de la posada → falta en FAQ, footer y `openingHoursSpecification` del JSON-LD.
- ¿Emiten **factura/CFDI**? Pregunta obligada para el público corporativo, hoy sin responder.
- Capacidad real para **grupos mayores a 6** personas.
- Material para entradas de blog de la categoría `aliados` (colaboraciones con otros grupos
  del país). La categoría existe en el schema pero aún no tiene entradas.
- ⚠️ Los letreros de marca generados con IA tienen el typo **"FORJADRES"** (sin la O). El sitio
  usa solo el escudo recortado + el nombre en tipografía real. Avisarle antes de que imprima algo.

**Deuda técnica:**
- Migrar a **Astro 7** y **sharp 0.35+**: hay CVEs conocidas sin parche en la rama 5.x. Riesgo
  real bajo hoy (sitio estático, sin formularios ni islas hidratadas), pero conviene hacerlo
  antes de agregar cualquier funcionalidad interactiva.
- No hay testimonios ni prueba social. Se agregarán cuando existan clientes reales;
  **nunca inventarlos**.

## 7. Convenciones del proyecto

- **Voz de marca:** el posadero carismático — épico, cálido, tutea al lector, accesible para
  quien nunca ha jugado. Español de México.
- **"Forjadores" siempre con O.** El typo "FORJADRES" no debe entrar al sitio.
- **Solo hechos verificables:** precios, políticas y afirmaciones salen de los documentos de
  marca de Pollo (`brand/originales/`). Nada de estadísticas, testimonios ni datos inventados.
- **Accesibilidad:** WCAG 2.1 AA como piso — contraste 4.5:1, `alt` en todas las imágenes, foco
  visible, áreas táctiles de 44px, `prefers-reduced-motion` respetado.
- **CSS:** reglas propias siempre dentro de `@layer base` o `@layer components`, para que las
  utilidades de Tailwind puedan sobreescribirlas (un choque de capas dejó un botón invisible una vez).
- **Verificar antes de afirmar:** el flujo del proyecto ha sido construir → medir en navegador
  real (puppeteer-core + Chrome del sistema) → desplegar → confirmar en vivo.
