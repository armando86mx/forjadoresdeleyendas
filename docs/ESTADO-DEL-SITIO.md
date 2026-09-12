# Estado del sitio — Forjadores de Leyendas

Documento de handoff. Última actualización: **2026-09-11**, commit `(rama feature/eventos-app)`.
Sitio **en producción** en https://forjadoresdeleyendas.mx (verificado en vivo). La sección de
**eventos (fase 2, ya migrada a la cuenta del negocio) vive en la rama `feature/eventos-app`**,
pendiente de mergear a `main` y publicar.

---

## 1. Qué es esto

Sitio de **registro** para las **partidas públicas de rol** (D&D y otros sistemas) que organiza
un colectivo multi-ciudad — **Puebla, CDMX, Guadalajara** — ya no la venta de sesiones privadas
de un solo negocio.

- **Dueño del negocio / RP del colectivo:** Ernesto, alias **Pollo** (amigo de Armando). Le
  entregan portadas y descripciones de cada partida; él las publica desde el panel.
- **La posada de Pollo**, en el Barrio de Analco, Puebla, **sigue existiendo** como la
  **mazmorra** (sede) matriz del colectivo — pero ya no es el objeto de venta del sitio.
- **Objetivo del sitio (cambió en fase 2):** que el visitante **se registre en el formulario**
  de una partida. La conversión es ese registro, confirmado **por correo**. **WhatsApp queda
  solo como canal de soporte**, nunca como vía de registro; ya no hay CTA de conversión por
  `wa.me`.
- **Reemplazó** a un WordPress + Elementor anterior, que fue eliminado por completo del servidor.

**Terminología obligatoria de fase 2** — usar siempre estas palabras en toda superficie visible
(sitio, panel, hoja, correo):

| Término | Significado |
|---|---|
| **Narrador** | quien dirige la partida (nunca "Guildmaster") |
| **Mazmorra** | la sede física donde ocurre la partida |
| **Partida** | la ejecución concreta: fecha, hora, mazmorra, narrador, cupo |
| **Evento** | la categoría/nombre reutilizable de la partida (p. ej. "Fragmentación", "El día del Hobbit") |
| **Sistema** | el sistema de juego (D&D, Médula, Nawal…) |

Contexto estratégico completo en [`PRODUCT.md`](../PRODUCT.md) (usuarios, personas, principios,
anti-referencias) y sistema visual en [`DESIGN.md`](../DESIGN.md).

## 2. Stack y arquitectura

| Pieza | Detalle |
|---|---|
| Framework | **Astro 7** (100% estático, cero JS de hidratación) — migrado en fase 2 |
| Estilos | **Tailwind CSS 4** vía `@tailwindcss/vite` (sin archivo `tailwind.config`) |
| Tipografía | Cinzel (títulos) + Inter Variable (cuerpo), self-hosted con `@fontsource` |
| Imágenes | `astro:assets` + **sharp 0.35** (migrado); ilustraciones generadas con Gemini (Nano Banana) |
| Contenido | Content collections en Markdown (`src/content/cronicas/`) |
| Alias | `@/*` → `src/*` |

### Backend de eventos (fase 2, cuenta del negocio)

**Google Apps Script + Google Sheets**, todo bajo la cuenta **`forjadoresdeleyendas@gmail.com`**
(dueña de la hoja, el script y las carpetas de Drive).

| Pieza | Detalle |
|---|---|
| Código | `apps-script/` en este repo |
| Publicar | `npx @google/clasp@2.4.2 push -f` — clasp está logueado como la cuenta del negocio |
| Hoja (Sheet ID) | `1r6B-phqB7MN25oA7-islkn2dB-24F_R52p41ZYjams8` |
| Script ID | `1-vtjoTcWceomrb7Pj6CP8YZrZ7WwUG-wjT1b4eZYu_8uaSgzEVhtdl_i` |
| Despliegues web | dos: **API pública** (anónima, la consume el sitio) y **Panel** ("Solo yo" + URL con `?panel=1`) |
| reCAPTCHA v3 | **fail-closed** — secreto en Script Properties `RECAPTCHA_SECRET`; propiedad `MODO=dev` solo para desarrollo local |
| Disparador mensual | `archivarMesVencido` — día 1, ~3 AM: respalda a "Forjadores — Respaldos" **antes** de borrar los vencidos |

### Estructura relevante

```
src/
  pages/          index.astro · faq.astro · aviso-de-privacidad.astro · cronicas/index.astro ·
                  cronicas/[slug].astro · 404.astro
  layouts/        BaseLayout.astro        (metas, OG, canonical, noindex opcional, Analytics)
  components/     Header · Footer · WhatsAppButton · SectionTitle · Eventos · Analytics
  data/           precios.ts · menu.ts · faq.ts     (contenido estructurado, editable sin tocar JSX)
  lib/            site.ts (SITE + waLink()) · eventos-config.ts (URL de la API + site key de reCAPTCHA)
  styles/         global.css  (tokens @theme, capas base/components, .card, .card-lift, .ornament)
  content/cronicas/   2 entradas en Markdown
public/           .htaccess · robots.txt · favicon.svg · og-default.jpg · <indexnow-key>.txt
apps-script/      backend de eventos: API, panel, archivado mensual, pruebas (detalle arriba)
docs/superpowers/ specs y planes del proyecto (incluye diseño de fase 1 y fase 2 de eventos)
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

### Apps Script (backend de eventos)

- ⚠️ **NUNCA usar `clasp deploy`**: crea un despliegue nuevo y destruye el entry point web
  activo (rompe la URL de la API y/o del panel en uso). Publicar código siempre con
  `npx @google/clasp@2.4.2 push -f`.
- **Las versiones de despliegue web se crean SOLO desde el editor de Apps Script**
  (Desplegar → Administrar despliegues), con una pestaña **recién recargada**. Ante diálogos
  rotos o colgados, no reintentar ahí: crear un **despliegue nuevo**.
- `.clasp.json` (dentro de `apps-script/`) trae un `rootDir` **absoluto de esta máquina**. En
  otra máquina hay que regenerarlo antes de poder hacer `push`.

## 4. Estado del contenido (2026-09)

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
`SITE.description` y el JSON-LD (perdió `FoodEstablishment`, `servesCuisine`, `priceRange` y
`hasMenu`).

**La FAQ fue depurada**: quedaron 11 preguntas sobre sesiones, reservaciones y contacto.
Se retiraron las de costos, métodos de pago, penalización por cancelación, descuentos y
alimentos. Las respuestas originales están en el historial de git.

**Decisiones registradas (fase 2):**
- **WhatsApp es SOLO canal de soporte**, nunca de registro — no debe volver a aparecer como CTA
  de conversión en ninguna sección.
- **El blog conserva** sus menciones de posada/sesiones/comida por decisión de Armando: son
  relatos fechados, no promesas de servicio vigente.
- **La columna "No." del Excel se eliminó**: era el número de rolero de una base externa de
  Pollo; no aplica al modelo de eventos del colectivo.

### Secciones vivas de la home, en orden

Hero → **`#eventos`** (dinámica, datos en vivo desde la API de Apps Script) →
"¿Nunca has jugado rol?" (3 pasos) → "Forja un equipo de leyenda" (team building) → CTA final.

Se eliminaron en fase 2: "Qué incluye tu sesión" (3 tarjetas) y "Encuéntranos en el Barrio de
Analco" (ubicación con mapa). Precios y banquete siguen ocultos por flags (tabla arriba).

## 5. Medición, SEO y seguridad

- **Google Analytics 4:** `G-K77Y23Q30L` · **Microsoft Clarity:** `xugemald3n`.
  Se inyectan solo si hay ID; en local viven en `.env` (gitignored) y en producción en las
  **Variables** del repo de GitHub (Settings → Secrets and variables → Actions → **Variables**),
  **no** en Secrets.
- **IndexNow:** clave `5421e1be952874a0c0c5c3bdf60bc77d`, con ping automático en el workflow.
- **Sitemap:** **5 URLs** (home + índice de crónicas + 2 entradas + `/aviso-de-privacidad/`). La
  FAQ sigue excluida a propósito.
- **Meta título y descripción de la home** actualizados a las partidas multi-ciudad del
  colectivo (ya no describen sesiones privadas de la posada).
- **`public/.htaccess`:** 404 propia, redirect `www` → apex, bloqueo de `/.git`, headers de
  seguridad (nosniff, X-Frame-Options, Referrer-Policy, HSTS, Permissions-Policy) y caché
  (HTML `no-cache`, `/_astro/` inmutable un año).
- **Auditorías (última corrida, sitio ya en vivo, previa a fase 2):** seguridad **riesgo bajo**,
  SEO **8/10**, diseño **26/36**. Snapshots de las críticas de diseño en `.impeccable/critique/`.

## 6. Pendientes

**De Armando (accesos y datos que solo él tiene):**
- Webhook de despliegue automático en Hostinger, para dejar de presionar "Desplegar".
- Alta en **Google Search Console** y creación del **Perfil de Negocio de Google** (lo de mayor
  impacto para SEO local que falta); luego Bing Webmaster importa desde Search Console.
- Coordenadas geográficas del local, para completar el JSON-LD.

**De Pollo (datos del negocio):**
- **Foto del dado d20**: hoy el sitio usa el emoji 🎲 en su lugar; sustituir en cuanto la mande.
- **Horario** de la posada → falta en FAQ, footer y `openingHoursSpecification` del JSON-LD.
- ¿Emiten **factura/CFDI**? Pregunta obligada para el público corporativo, hoy sin responder.
- Capacidad real para **grupos mayores a 6** personas.
- Material para entradas de blog de la categoría `aliados` (colaboraciones con otros grupos
  del país). La categoría existe en el schema pero aún no tiene entradas.
- ⚠️ Los letreros de marca generados con IA tienen el typo **"FORJADRES"** (sin la O). El sitio
  usa solo el escudo recortado + el nombre en tipografía real. Avisarle antes de que imprima algo.
- ⚠️ **Traspaso/renovación de dominio: 28-feb-2027.** Pollo puso recordatorio para avisar el
  15-ene-2027.

**Fase 3 (posible, sin comprometer):**
- Correo de confirmación desde **`correo@forjadoresdeleyendas.mx`** (alias Gmail + SMTP de
  Hostinger) para librar el filtro de spam agresivo de Hotmail.
- Bot de WhatsApp.
- Bitly / métricas de origen de tráfico.
- Exponer el **`cupo`** real en el JSON de la API: hoy el "de 6" que se muestra en el sitio está
  **fijo en el código**, no viene del dato real de la partida.

**Operativas (riesgo si se ignoran):**
- Compartir el Excel de eventos **solo en modo lectura** — escritura de alguien ajeno al panel
  puede tronar la página.
- **No borrar catálogos** (nombres de evento, sistemas, mazmorras, narradores) que ya tengan
  partidas referenciándolos: deja tarjetas con huecos en el sitio.
- **No crear carpetas de Drive homónimas** a "Forjadores — Fotos de eventos" ni
  "Forjadores — Respaldos" — rompe las rutas que el script espera.
- Los **respaldos mensuales conservan PII** aunque a alguien se le borre de la hoja viva —
  cualquier proceso de derechos ARCO debe incluir también esos respaldos.
- **Registros falsos siguen siendo posibles** si un humano pasa el CAPTCHA a mano; mitigado por
  el tope de cupo (6) y el botón "Liberar lugar" del panel, no eliminado del todo.

**Deuda técnica:**
- No hay testimonios ni prueba social. Se agregarán cuando existan clientes reales;
  **nunca inventarlos**.

## 7. Convenciones del proyecto

- **Voz de marca:** el posadero carismático — épico, cálido, tutea al lector, accesible para
  quien nunca ha jugado. Español de México.
- **Terminología de fase 2 es obligatoria** en toda superficie visible (sitio, panel, hoja,
  correo): Narrador, Mazmorra, Partida, Evento, Sistema — ver tabla en §1. Nunca "Guildmaster".
- **"Forjadores" siempre con O.** El typo "FORJADRES" no debe entrar al sitio.
- **Solo hechos verificables:** precios, políticas y afirmaciones salen de los documentos de
  marca de Pollo (`brand/originales/`). Nada de estadísticas, testimonios ni datos inventados.
- **El correo de confirmación avisa revisar spam** — mantener ese aviso si se rediseña la
  plantilla.
- **Accesibilidad:** WCAG 2.1 AA como piso — contraste 4.5:1, `alt` en todas las imágenes, foco
  visible, áreas táctiles de 44px, `prefers-reduced-motion` respetado.
- **CSS:** reglas propias siempre dentro de `@layer base` o `@layer components`, para que las
  utilidades de Tailwind puedan sobreescribirlas (un choque de capas dejó un botón invisible una vez).
- **Verificar antes de afirmar:** el flujo del proyecto ha sido construir → medir en navegador
  real (puppeteer-core + Chrome del sistema) → desplegar → confirmar en vivo.
