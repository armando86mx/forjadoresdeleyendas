# Diseño — Aplicación de gestión de eventos

Fecha: 2026-09-05 · Estado: **aprobado en conversación, pendiente de revisión final de Armando**

## 1. Objetivo

Automatizar el circuito de eventos públicos mensuales de D&D (~6 al mes, en varias sedes y
ciudades) para que Pollo no gestione registros a mano:

- El **sitio** muestra en automático los eventos vigentes y recibe registros con validación de cupo.
- La **hoja de Google** existente sigue siendo la herramienta operativa: los registros caen solos
  en ella, con nombre, teléfono y correo.
- **Pollo administra** ciudades, sedes, Guildmasters y eventos desde un panel web privado, sin
  tocar código ni romper la hoja.

## 2. Arquitectura

```
Visitante ──▶ forjadoresdeleyendas.mx (Astro estático en Hostinger, sin cambios de hosting)
                  │  fetch eventos / envía registro (JS del navegador)
                  ▼
              Apps Script (backend gratuito, pegado a la hoja de Google)
                  │  lee/escribe                     │ envía correos (MailApp)
                  ▼                                  ▼
              Google Sheets (base de datos)      Confirmaciones a registrados
                  ▲
Pollo ──▶ Panel admin (página web privada de Apps Script, login = su cuenta de Google)
              fotos ──▶ carpeta de Google Drive
```

Piezas nuevas de hosting o costo mensual: **ninguna**. Los datos de eventos nunca pasan por
Hostinger: el HTML no los contiene, se consultan en vivo en cada carga (con parámetro
anti-caché). Un cambio de Pollo se ve en la siguiente carga de página de cualquier visitante.

## 3. Modelo de datos (pestañas de la hoja)

| Pestaña | Columnas | Notas |
|---|---|---|
| `Ciudades` | id, nombre | Puebla y CDMX de inicio; extensible desde el panel |
| `Sedes` | id, ciudadId, nombre, dirección, enlace Google Maps | |
| `Guildmasters` | id, nombre | |
| `Eventos` | id, nombre, descripción de la aventura, fecha, hora, sedeId, guildmasterId, fotoUrl, cupo (6) | foto opcional |
| `Registros` | id, eventoId, nombre, teléfono, correo, timestamp | una fila por persona |
| **Vista bonita** (pestaña principal) | cuadrícula tipo la actual: cada evento con sede, fecha, GM y sus 6 lugares | **regenerada automáticamente; solo lectura** |

- Las pestañas de datos quedan **protegidas** (solo la cuenta dueña y el script editan).
- Ediciones manuales en la vista bonita se pierden en la siguiente regeneración: las
  correcciones se hacen desde el panel.
- Nada se borra al expirar: los eventos pasados quedan en la hoja como historial.
- Columna "No." de la hoja actual: **significado desconocido** (pendiente preguntar a Pollo).
  Se reserva una columna libre en la vista bonita; si resulta que el sistema debe generarla,
  se revisa este diseño.

## 4. Sección `#eventos` en la home

- **Ubicación:** entre "Qué incluye tu sesión" y team building (el hueco de la sección Precios
  oculta, `src/pages/index.astro`). Conserva la alternancia de fondos.
- **Agrupación por ciudad:** encabezado por ciudad ("Puebla", "Ciudad de México", …) y además
  etiqueta de ciudad en cada tarjeta — pueden coexistir eventos el mismo día y hora en ciudades
  distintas.
- **Tarjeta:** foto (o ilustración por defecto), ciudad, nombre del evento, descripción de la
  aventura, fecha, hora, Guildmaster, sede con dirección y enlace a Maps, "Quedan N lugares".
- **Reglas de visibilidad:**
  - Se muestran los eventos cuyo mes **no ha terminado** (mes en curso y meses futuros),
    zona horaria America/Mexico_City. Al terminar el mes desaparecen solos.
  - Pollo puede borrar un evento manualmente en cualquier momento desde el panel.
  - Evento con la hora de inicio ya pasada: sigue visible el resto del mes, pero el botón dice
    **"Evento concluido"** y no acepta registros. *(Decisión reversible si Armando/Pollo
    prefieren otra cosa.)*
  - Cupo lleno: botón bloqueado con **"Cupo completo"**; si Pollo libera un lugar, se reactiva solo.
- **Estados de la consulta:** loading elegante mientras responde Apps Script (~1–2 s); si Google
  no responde, mensaje con el enlace de WhatsApp de siempre como plan B.

## 5. Registro (modal en la misma página)

1. Clic en "Registrarse" → modal (en móvil, hoja a pantalla completa) que **reconsulta** el
   evento (cupos y datos frescos) y lo muestra como confirmación visual.
2. "¿Cuántos lugares?" (limitado a los disponibles) → nombre, teléfono y correo **por persona**.
   Los grupos van en un solo envío, así no compiten entre sí por los lugares.
3. Enviar → éxito ahí mismo, sin navegación.

**Validación y anti-spam** (frontera de confianza — no se simplifica):

- **El servidor es el árbitro:** Apps Script toma un candado (`LockService`), cuenta los
  registros reales y solo escribe si caben. Si el cupo se llenó mientras llenaban el
  formulario: mensaje amable con los lugares restantes. El contador del frontend es informativo.
- **reCAPTCHA v3 (invisible)** verificado del lado del servidor + campo honeypot.
- Formato de correo y teléfono validados; **duplicados rechazados** (mismo correo, mismo evento).
- Botón deshabilitado durante el envío (evita doble clic).
- **Aviso de privacidad:** línea en el formulario ("Tus datos solo se usan para gestionar tu
  registro") con enlace a una página sencilla de aviso de privacidad (LFPDPPP). Primera
  recolección de datos personales del sitio.

## 6. Correos de confirmación

Cada persona registrada recibe un correo (desde la cuenta de Google dueña del sistema) con:
nombre del evento, descripción, ciudad, fecha, hora, Guildmaster, sede, dirección y enlace de
Google Maps. Volumen máximo teórico ~36/mes; cuota gratuita ~100/día — sobra.

## 7. Panel de administración

Página web privada generada por Apps Script (URL en `script.google.com`, guardada en
favoritos). **Login = cuenta de Google del dueño**; solo esa cuenta puede entrar. Funciona
desde el celular. Funciones:

- CRUD de ciudades, sedes (nombre, dirección, Maps) y Guildmasters.
- Crear/editar/borrar eventos: menús desplegables de ciudad → sede → Guildmaster, fecha, hora,
  nombre, descripción, foto.
- **Subir foto:** el panel la comprime en el navegador (~200 KB) y Apps Script la guarda en una
  carpeta de Drive; la hoja guarda la URL. *(Límite conocido: servir imágenes desde Drive es
  tolerado, no un CDN formal; si el tráfico crece, es la primera pieza a mudar.)*
- **Borrar registros** individuales → libera el cupo al instante en el sitio.

Notificar a registrados por cambios/cancelación de evento: **manual** en esta versión (sus
datos están en la hoja).

## 8. Cambios al sitio actual

- Hero: "Reserva tu aventura" pasa de WhatsApp a **ancla `#eventos`**.
- Se **elimina** el botón "Cotiza tu evento" (team building).
- Página nueva: aviso de privacidad.
- **Paso previo:** migrar Astro 5 → 7 y sharp ≥ 0.35 (deuda técnica ya documentada en
  `ESTADO-DEL-SITIO.md`; saldarla antes de agregar funcionalidad interactiva).

## 9. Desarrollo en cuenta de Armando → traspaso a Pollo

Se construye y prueba completo bajo la cuenta de Google de Armando. Al aprobarse:

1. Copia de la hoja bajo la cuenta de Pollo (el script viaja pegado a la copia).
2. Publicar el web app y el panel desde su cuenta (URLs nuevas; correos salen de su cuenta).
3. Actualizar la constante del endpoint en el sitio y redesplegar (un commit).
4. Recrear las claves de reCAPTCHA bajo su cuenta.

## 10. Fuera de alcance (a propósito)

- Lista de espera cuando el cupo está lleno.
- Notificaciones automáticas por cambio/cancelación de evento.
- Pagos, recordatorios, check-in el día del evento.
- Multi-administrador (solo la cuenta de Pollo).

## 11. Pendientes de información

- Qué significa la columna "No." (168, 72, …) de la hoja actual — preguntar a Pollo.
- Confirmar con Pollo el matiz "Evento concluido" (§4).
