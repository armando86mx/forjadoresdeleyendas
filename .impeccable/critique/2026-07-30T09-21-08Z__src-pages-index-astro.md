---
target: página de inicio (home)
total_score: 28
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 2
timestamp: 2026-07-30T09-21-08Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review · B: detector/browser evidence)

## Design Health Score

| # | Heurística | Score | Issue clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | Nav sin página activa (aria-current); sin wayfinding |
| 2 | Sistema ↔ mundo real | 4 | Metáfora tabernera glosada donde importa |
| 3 | Control y libertad | 4 | Falta "volver arriba" en página de ~8600px |
| 4 | Consistencia y estándares | 2 | Mismo tratamiento visual para tarjetas clicables/informativas/precio; borde único sin explicar |
| 5 | Prevención de errores | 4 | waLink() único; sin formularios |
| 6 | Reconocimiento vs recuerdo | 3 | "Arma tu campaña" vs "Cotiza tu evento" sin decir cuál aplica a quién |
| 7 | Flexibilidad y eficiencia | n/a | Superficie de persuasión de visita única |
| 8 | Estética y minimalismo | 2 | Jerarquía depende de tipografía+alternancia; contraste tarjeta/fondo 1.14:1 medido |
| 9 | Recuperación de errores | 4 | 404 "Tirada fallida" con doble ruta — mejor momento de craft |
| 10 | Ayuda y documentación | 3 | FAQ completa pero preguntas clave enterradas (novato pos. 4/4; team building 20/20) |
| **Total** | | **28/36** | **Good (78%)** |

## Veredicto de especificidad

La identidad vive en ilustración + voz (excelentes); la ESTRUCTURA es gramática de landing genérica con piel temática: los grids de tarjetas, pricing table y acordeón podrían ser de una clínica dental. Detector: 0 hallazgos estáticos; en navegador 7 (home) + 17 (faq) + 4 (crónicas): line-length 88–105ch, kicker-above-heading ×4 (eyebrow como scaffolding), body-text-viewport-edge. Falsos positivos verificados con medición: contraste del hero (overlay bg-ink/60 no resuelto por el detector) y text-occlusion en FAQ (details cerrado nativo).

## Lo que funciona

1. Sistema voz+ilustración consistente hasta en el 404 — evita el kitsch prohibido.
2. WhatsAppButton: el elemento mejor pulido (hover completo, active press, focus ring, mensajes contextuales) — prueba de que la debilidad de tarjetas es decisión no tomada, no límite técnico.
3. Onboarding "3 pasos" como primera misión; segundo micro-pico tras el hero.

## Issues prioritarios

- **[P0] Sistema de superficies sin rango tonal** — parchment vs parchment-light = 1.14:1; hover card-raise = ~4% de luminancia (imperceptible); card-raise aplicado a divs no clicables; border-wood/20 del bloque equipo = 1.38:1 (invisible). Causa raíz de todo el "plano". Fix: bordes reales consistentes + sombra en reposo más profunda + hover reservado a lo interactivo. → /impeccable polish (tokens)
- **[P1] Precios: borde único se lee como accidente** — destacar el one-shot es correcto (novato = persona #1) pero sin badge no comunica. Fix: badge "Empieza aquí" + borde familiar sutil en las 3 campañas. → /impeccable layout
- **[P1] Team building infra-ponderado** — bloque más pequeño que una tarjeta de precio, sin CTA propio, DESPUÉS de los botones. Persona #3 de PRODUCT.md como nota al pie. Fix: sección propia con imagen y CTA dentro. → /impeccable bolder
- **[P2] Banquete: pared de 8 tarjetas idénticas** — sin agrupar (comida/bebida/postre), sin tratamiento, tras la mejor foto del sitio; valle emocional del 65-70% del scroll. Fix: motivo de carta de posada con grupos. → /impeccable layout
- **[P2] Touch targets y legibilidad medidos** — nav móvil 33px, summary FAQ 24px (piso 44px del propio PRODUCT.md); párrafos 88–105ch (máx 80); p tocando bordes del viewport. → /impeccable adapt
- **[P3] FAQ sin priorizar por persona** — reordenar; "Lo que más preguntan" arriba. → /impeccable clarify

## Red flags por persona

- Jordan (novato): bien recibido al inicio, pero su pregunta ansiolítica enterrada; "Arma tu campaña" = lenguaje de compromiso multi-sesión para quien quiere probar.
- Casey (móvil): sin CTA persistente en página de ~11 viewports; touch targets bajo 44px en nav y FAQ; "Crónicas" huérfano en segunda línea del header.
- RH (team building): bloque menos destacado de la sección; FAQ al final; vacío de contenido: "grupos de 3 a 6" se lee como tope — nadie responde "¿y si somos 15?"; CTA antes que la explicación.

## Observaciones menores

fire sobre parchment = 4.43:1 (bajo 4.5 para texto pequeño: eyebrow "CRÓNICA"); nav sin estado activo; sección novatos sin eyebrow (inconsistencia); precio duplicado en precios.ts y faq.ts; card-lift (el mejor hover) solo en la página de menor tráfico.

## Preguntas

1. ¿Y si la especificidad de marca entrara en la ESTRUCTURA (pricing como tablón de posada, banquete como carta) y no solo en contenido?
2. ¿El borde de sesión suelta es jerarquía o accidente? Si es jerarquía, ¿por qué no lo dice en una palabra?
3. ¿El problema es "falta motion" o que la paleta de superficies nunca tuvo rango tonal para cargar jerarquía?
