---
target: página de inicio (home) — re-crítica
total_score: 26
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
timestamp: 2026-07-30T22-58-11Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review fresh · B: detector/browser evidence)

## Design Health Score: 26/36 (Good, 72%)

| # | Heurística | Score |
|---|---|---|
| 1 Visibilidad estado | 2 (ancla tapa título de sección, sin activo en links #) |
| 2 Sistema-mundo real | 4 (tablón/carta/posadero) |
| 3 Control y libertad | 3 |
| 4 Consistencia | 3 |
| 5 Prevención errores | 3 (penalización cancelación lejos del CTA) |
| 6 Reconocimiento | 2 (FAQ destacadas duplicadas verbatim) |
| 7 | n/a |
| 8 Estética/minimalismo | 2 (duplicación FAQ, 8 filas sin subgrupo, header móvil 2 filas) |
| 9 Recuperación | 4 (404 ejemplar) |
| 10 Ayuda | 3 |

Nota de comparación: score anterior 28/36 con otro revisor. Los P0/P1 de la primera crítica (contraste superficies, precios sin badge, team building nota al pie) están RESUELTOS y este revisor los cita como fortalezas (tablón/carta = "objetos físicos de taberna, no patrones SaaS"). El score baja porque la investigación fue más profunda: destapó el bug de anclas (existente desde el día 1, agravado en móvil por header de 2 filas) y la duplicación de FAQ introducida con las destacadas.

## Hallazgos clave A (+ verificación controller)
- [P1] Anclas /#precios /#banquete: header sticky tapa título — medido: 62px desktop, 154px móvil. Fix scroll-margin-top.
- [P1] FAQ destacadas duplicadas (sin filter en loop principal).
- [P2] Penalización $250 no visible junto a CTA de reserva.
- [P2] "Reservaciones y pagos" = 8 filas sin subagrupar.
- [P3] Team building con registro genérico vs anti-referencia de PRODUCT.md.
- Personas: falta factura/CFDI (RH), qué mueve el rango $300-500 (novato), capacidad >6 sin señal (RH). = datos de negocio pendientes de Pollo/Armando.

## Detector B
CLI estático: 0. Browser: home 8 grupos (3 FP verificados: contraste hero con overlay, footer edge, y en FAQ occlusion de details cerrado), reales: kicker x2 (badge Empieza aquí + eyebrow Team building — adjudicados como sistema de marca deliberado), nested-cards x4 (tablón = estructura física intencional), line-length 105ch en intro de crónicas (real). FAQ: 17→2 (ambos FP). Mediciones: nav 44px, cards 1px+sombra real, FAB 56px solo móvil, overflow 0, sin transiciones >400ms.
