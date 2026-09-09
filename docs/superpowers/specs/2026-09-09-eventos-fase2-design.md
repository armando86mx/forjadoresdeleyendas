# Diseño — Fase 2: ajustes de la llamada con Pollo (2026-09-08)

Fuente: transcripción de la llamada Armando–Pollo. Confirmaciones de Armando en chat (2026-09-09).
Estado: **aprobado**. Complementa `2026-09-05-eventos-app-design.md`.

## 1. Contexto del cambio

La página deja de vender la posada ("sesiones privadas") y pasa a ser la página de registros de
los **eventos públicos del colectivo**, multi-ciudad (Puebla, CDMX, Guadalajara…). Pollo es RP del
colectivo: le entregan portadas y descripciones; él solo copia, pega y publica.

## 2. Modelo de datos (cambios)

- **Nuevo catálogo `NombresEventos`** (id, nombre): "Fragmentación", "RPG", "El día del Hobbit"…
  Reutilizable: un evento-nombre tiene muchas ejecuciones.
- **Nuevo catálogo `Sistemas`** (id, nombre): D&D, Médula, Nawal… creable desde el panel.
- **`Guildmasters` → `Narradores`** (renombrar tab, campos y etiquetas en panel, hoja, sitio y correo).
- **`Eventos` (ejecuciones)** queda: id, nombreEventoId, **partida** (texto manual), sistemaId,
  descripcion, fecha, hora, sedeId, narradorId, fotoUrl, cupo.
- La sede se etiqueta **"Mazmorra"** de cara al público (solo esa palabra).
- Sin migración de datos: todo lo actual es utilería; se reinstala el esquema limpio.

## 3. Reglas nuevas

- **Anti-duplicado de ejecuciones (ajuste)**: bloquear si coincide **sede + fecha + hora**,
  sin importar el nombre (dos partidas no caben en la misma mazmorra a la misma hora).
- **Anti-duplicado por nombre en catálogos** (ciudades, sedes, narradores, nombres de evento,
  sistemas): "Ya existe … con ese nombre" (case-insensitive, trim).
- **Anti doble-clic en el panel**: botones de crear/guardar deshabilitados mientras procesa.

## 4. Panel — formulario de creación de ejecución (orden)

1. Nombre del evento (selección de catálogo) → 2. Partida (texto) → 3. Sistema (selección)
→ 4. Mazmorra/sede (selección, implica ciudad) → 5. Narrador (selección) → 6. Fecha → 7. Hora
→ 8. Descripción de la aventura → 9. Foto.
Secciones de administración para los dos catálogos nuevos (crear/borrar), igual que ciudades.

## 5. Sitio web

- **Sección `#eventos` sube a primera posición** (inmediatamente después del hero).
- **Hero**: texto nuevo sin "privadas" ni posada — rol en las mazmorras de Puebla, CDMX y
  Guadalajara (redacción propuesta por Claude, aprueba Armando; ciudades en texto fijo).
- **Se eliminan**: sección "Qué incluye tu sesión", sección "Encuéntranos en el Barrio de Analco"
  (mapa), botón flotante de WhatsApp y enlace de WhatsApp del footer.
- **CTA final**: ancla a `#eventos` (ya no WhatsApp).
- **Tarjeta**: título = partida; evento como eyebrow/badge; chip de sistema; "Narrador: X";
  "Mazmorra: Y — cómo llegar"; descripción completa; fecha/hora; cupos.
- **Dado d20**: sustituir el 🎲 por imagen d20 (Pollo la manda; mientras, se queda el emoji).
- JSON-LD: actualizar descripción (ya no posada de sesiones privadas).
- Crónicas se queda (blog futuro).

## 6. Excel (vista bonita)

- Sin columna "No." (era el número de rolero de la base externa de Pollo; ya no se usa).
- Barra superior por bloque inicia con: **evento — partida — sistema** — fecha hora — mazmorra
  (ciudad) — narrador.
- Compartible en solo lectura (operativo, documentar advertencia de nunca dar escritura).

## 7. Correo de confirmación

- Incluye partida, evento, sistema, narrador, mazmorra (mismos términos que el sitio).
- Saldrá de **forjadoresdeleyendas@gmail.com** tras la migración.

## 8. Ciclo de vida mensual (funcionalidad NUEVA)

Hoy los eventos vencidos solo se ocultan. Lo prometido a Pollo:
- **Disparador mensual de Apps Script** (día 1, madrugada): (1) copia de respaldo de la hoja
  completa a la carpeta Drive "Forjadores — Respaldos" con nombre "Eventos <mes año>";
  (2) borra de la hoja las ejecuciones del mes vencido y sus registros; (3) regenera la vista.
- El respaldo SIEMPRE ocurre antes del borrado.

## 9. Aviso de privacidad

- Contacto ARCO: quitar WhatsApp y teléfono → correo **forjadoresdeleyendas@gmail.com** (mailto).
- El formulario de registro NO cambia: sigue pidiendo nombre, teléfono y correo.

## 10. Migración a la cuenta del negocio

Pollo entregó acceso a **forjadoresdeleyendas@gmail.com** (Armando ya tiene sesión). Plan:
terminar y probar en la cuenta de Armando → copia de la hoja (el script viaja) bajo la cuenta
del negocio → instalar/desplegar ahí (2 despliegues, propiedad RECAPTCHA_SECRET, disparador
mensual) → actualizar URL en `eventos-config.ts` → publicar. `CONFIG.adminEmails` pasa a la
cuenta del negocio (¿y la personal de Pollo? — solo la del negocio por ahora). Claves reCAPTCHA
actuales se conservan (funcionan por dominio); su traspaso de cuenta queda para después.

## 11. Plazos y entregables

- Objetivo: sitio publicado con todo lo anterior **antes del domingo** (links se reparten el lunes).
- Armando manda por WhatsApp: captura del aviso de privacidad y screenshots promocionales.
- Pendientes de Pollo: foto del d20, mensaje de confirmación.

## 12. Fuera de alcance (fase 3+)

- Bot de WhatsApp ("maguito Sonrix"), línea WhatsApp Business.
- Bitly/métricas de origen.
- Traspaso de claves reCAPTCHA a la cuenta del negocio.
