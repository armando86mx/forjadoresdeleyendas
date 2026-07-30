# Forjadores de Leyendas

Sitio estático para una taberna de _tabletop RPG_ ubicada en Puebla, México. Construido con Astro 5 + Tailwind CSS 4, con una estética medieval inspirada en aventuras fantásticas.

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo local (hot reload)
npm run dev

# Compilar para producción
npm run build
```

## Publicar una entrada de blog

Las crónicas (entradas del blog) viven en `src/content/cronicas/` y usan frontmatter estándar.

**Crear un archivo** `src/content/cronicas/mi-cronica.md`:

```markdown
---
title: "Título de la crónica"
description: "Breve resumen para meta tags"
pubDate: "2026-07-30"
categoria: "cronicas"
---

Contenido de la crónica en Markdown...
```

**Campos frontmatter:**
- `title` (string): Título visible
- `description` (string): Descripción para SEO y redes
- `pubDate` (YYYY-MM-DD): Fecha de publicación
- `categoria` ("cronicas" | "aliados"): Categoría de contenido

Luego haz push a `main`. La rama `main` es la fuente del sitio; un GitHub Action compilará y desplegará a la rama `hostinger-deploy` (que sirve como `public_html` en Hostinger).

## Pendientes de configuración

| Pendiente | Cómo se resuelve |
|---|---|
| ID de Google Analytics 4 | Crear propiedad en analytics.google.com → poner `PUBLIC_GA4_ID=G-XXXX` en `.env` para builds locales y en **Variables** del repo (Settings → Secrets and variables → Actions → pestaña Variables) para producción, ya que el workflow lee `vars.PUBLIC_GA4_ID` |
| ID de Microsoft Clarity | clarity.microsoft.com → nuevo proyecto → poner `PUBLIC_CLARITY_ID=xxxx` en `.env` para builds locales y en **Variables** del repo (Settings → Secrets and variables → Actions → pestaña Variables) para producción, ya que el workflow lee `vars.PUBLIC_CLARITY_ID` |
| Verificación Bing Webmaster | bing.com/webmasters → importar desde Google Search Console o agregar meta tag en `BaseLayout.astro` |
| IndexNow | Key ya generada: `5421e1be952874a0c0c5c3bdf60bc77d` (archivo en `public/`). Tras publicar contenido: `curl "https://api.indexnow.org/indexnow?url=https://forjadoresdeleyendas.mx&key=5421e1be952874a0c0c5c3bdf60bc77d"` |
| Rama de deploy en Hostinger | Confirmar que Hostinger jala la rama `hostinger-deploy` (carpeta raíz = `public_html`) |
| Menú real del restaurante | Editar `src/data/menu.ts` cuando Pollo lo confirme |
| Google Search Console | Dar de alta la propiedad y enviar el sitemap |

## Estructura del proyecto

- `src/pages/` — Rutas estáticas (index, 404, etc.)
- `src/content/cronicas/` — Entradas de blog (colección de contenido)
- `src/layouts/` — Layouts reutilizables (BaseLayout)
- `src/components/` — Componentes de Astro
- `public/` — Archivos estáticos (robots.txt, sitemap, etc.)
- `dist/` — Build generado por `npm run build`

## Configuración de repositorio

- **Repo:** https://github.com/armando86mx/forjadoresdeleyendas
- **Rama fuente:** `main`
- **Rama de producción:** `hostinger-deploy` (el GitHub Action ya la publica automáticamente tras cada push a `main`; solo falta configurar en Hostinger que jale de esa rama — ver tabla de pendientes)
- **Analytics:** Variables de entorno `PUBLIC_GA4_ID`, `PUBLIC_CLARITY_ID`
