# Especificación de diseño — Sitio web Forjadores de Leyendas

**Fecha:** 2026-07-30
**Estado:** aprobado por Armando (pendiente revisión final del documento)

## Resumen

Reemplazar el sitio WordPress actual (`forjadoresdeleyendas.mx`) por un sitio estático en Astro, con calidad profesional de diseño y copywriting, desplegado en Hostinger vía GitHub. El sitio vende la experiencia de Forjadores de Leyendas: una posada temática en Puebla con sesiones privadas de D&D y otros juegos de rol, dirigidas por "Guardianes de Historias", con comida temática y escenografía inmersiva.

**Objetivo principal:** convertir visitantes en reservas por WhatsApp, con foco en el público novato (personas que nunca han jugado rol).

## Stack y arquitectura

- **Astro** (sitio 100% estático) + **Tailwind CSS**.
- Contenido en **Markdown** (content collections de Astro): blog, FAQ, menú.
- Sin CMS, sin backend, sin base de datos. Armando publica contenido junto con Claude vía commits.
- Repositorio: `https://github.com/armando86mx/forjadoresdeleyendas` (fuente de verdad).
- **Despliegue:** GitHub Action compila (`npm run build`) en cada push a `main` y publica el resultado (`dist/`) en una rama de despliegue que Hostinger jala (auto o manual). Hostinger solo sirve archivos estáticos; no necesita Node.
  - *Pendiente:* confirmar qué rama/carpeta tiene configurada Hostinger para el deploy; el Action se ajusta a eso.
- El WordPress actual sigue vivo hasta que el nuevo sitio esté listo; entonces se apunta el dominio/carpeta al nuevo contenido. Sin downtime.

## Páginas y estructura

1. **Inicio (`/`)** — página principal de conversión:
   - Hero inmersivo con promesa clara y CTA a WhatsApp.
   - "¿Nunca has jugado rol?" — 3 pasos para novatos (público #1).
   - Qué incluye una sesión (Guardián de Historias, escenografía digital, comida y bebida, dados/miniaturas).
   - **Precios y paquetes visibles** (de la FAQ: sesión $300–500 MXN/persona; campañas 4/6/10 sesiones a $1,800/$2,400/$3,500 MXN/persona).
   - La experiencia (inmersión, banquete, Guardianes).
   - Ubicación con mapa: C. 12 Sur 908-1, Barrio de Analco, Puebla.
   - Footer con las 5 redes (X, YouTube, Instagram, TikTok, Twitch) y WhatsApp.
2. **El Banquete (sección del Inicio, con ancla `/#banquete`)** — menú temático **ficticio/de temporada** creado con libertad creativa (ej. "Hamburguesa del Vikingo", "Hot Dog del Aventurero", "Hidromiel de la Posada"). Marcado como menú de temporada para corregir fácil cuando Pollo confirme el menú real.
3. **FAQ (`/faq`)** — contenido completo del documento de Pollo, con schema.org FAQPage.
4. **Crónicas de la Posada (`/cronicas`)** — blog en Markdown con dos categorías:
   - **Crónicas:** sesiones, eventos, noches temáticas.
   - **Aliados:** colaboraciones y viajes con grupos de rol de otras partes del país.
   - Lanzar con 1–2 entradas reales escritas con Pollo. **Sin** integración con API de Instagram (frágil y de alto mantenimiento; el blog cuenta mejor esa historia).
5. **404 temática** — "Tirada fallida: esta página no existe".

## Reservas

- Botones de WhatsApp (+52 2221 890232) con **mensaje precargado según contexto** (sesión suelta, campaña, evento/team building).
- Fallback: número visible por si el deep link falla.
- Sin formularios ni calendario en esta versión.

## Identidad visual

- **Paleta taberna:** pergamino, madera, ámbar/fuego + verde del escudo.
- **Tipografía:** display de fantasía legible solo en títulos; sans limpia en cuerpo.
- **Logo:** escudo (yunque + d20) **sin texto** + nombre compuesto en tipografía real. Esto elimina el typo "FORJADRES" presente en todos los letreros generados con IA. ⚠️ Avisar a Pollo del typo antes de que imprima material físico.
- **Imágenes:** set nuevo y coherente generado con Nano Banana (API de imágenes de Google/Gemini), estilo ilustración cálida de fantasía. Reemplaza la mezcla actual de DALL·E + stock.
- Tono: inmersivo pero sobrio. Nada de cursores de espada, sonidos, ni kitsch de plantilla RPG.

## Copywriting

- Todo el copy del sitio y del blog con la **voz de marca definida por Pollo**: el posadero carismático — épico, cálido, accesible para novatos. Referencias: mensajes de ejemplo del documento "Forjadores de Leyendas.docx" (sección 18).
- Temas: aventura, D&D, imaginación, comunidad.
- Redactado con skills de copy/SEO, no texto de relleno.

## Medición, SEO y visibilidad en IAs

- **Google Analytics 4** y **Microsoft Clarity** integrados desde el inicio (IDs como variables de configuración; placeholders hasta que Armando los pase — cambio de una línea).
- **Bing Webmaster Tools** (verificación) + **IndexNow**, para indexación y citación por IAs (Copilot/ChatGPT).
- Sitemap.xml, robots.txt, metadatos Open Graph.
- Datos estructurados: LocalBusiness (dirección de Analco), FAQPage, Menu/MenuItem.
- Rendimiento objetivo: carga < 1s (estático), accesibilidad básica (contraste, alt en imágenes, navegación por teclado).

## Fuera de alcance (esta versión)

- Tienda geek / e-commerce (en pausa por decisión del negocio).
- Sistema de reservas con calendario.
- CMS visual para Pollo.
- Integración con API de Instagram.

## Pendientes (no bloquean el diseño)

| Pendiente | Responsable |
|---|---|
| Rama/carpeta de deploy configurada en Hostinger | Armando |
| IDs de GA4 y Clarity | Armando |
| Verificación de Bing (meta tag) | Armando (cuenta) / Claude (integración) |
| Menú real del restaurante | Pollo (mientras tanto, menú ficticio de temporada) |
| Material para 1–2 entradas iniciales del blog | Pollo |
| Avisar a Pollo del typo "FORJADRES" en los letreros | Armando |
