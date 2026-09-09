# Plan de implementación — Fase 2 (ajustes de la llamada con Pollo)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el sitio en la página de registros del colectivo (multi-ciudad), con catálogos de eventos/sistemas/narradores, partida manual, archivado mensual automático y migración a la cuenta forjadoresdeleyendas@gmail.com.

**Architecture:** Igual que fase 1 (Astro estático + Apps Script + Sheets). Spec: `docs/superpowers/specs/2026-09-09-eventos-fase2-design.md`. Los implementadores LEEN los archivos actuales y aplican los estados objetivo descritos; el código verbatim se da solo para las piezas nuevas o delicadas.

**Tech Stack:** el de fase 1. Rama: `feature/eventos-app` (continúa).

## Global Constraints

- Todo lo de fase 1 sigue vigente (POST text/plain, TZ America/Mexico_City, cupo 6, esc() en innerHTML, commits en español + trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`, NUNCA `clasp deploy`, despliegues solo desde editor recargado).
- Terminología pública: **Narrador** (no Guildmaster), **Mazmorra** (la sede), **Partida** (ejecución), **Evento** (categoría contenedora), **Sistema** (sistema de juego).
- Sin migración de datos: la utilería actual se elimina con `resetFase2()`.
- Pruebas del panel vía la URL `/dev` del propietario (sin redeploys); la URL `/exec` pública se actualiza de versión por lotes (manual de Armando) cuando el plan lo indica.
- Los datos de todos los formularios de registro NO cambian (nombre, teléfono, correo).

---

### Task 1: Backend — esquema nuevo y API

**Files:** Modify: `apps-script/config.js`, `apps-script/instalar.js`, `apps-script/api.js`, `apps-script/pruebas.js`

**Interfaces:** Produces: nuevas HOJAS/ENCABEZADOS; `resetFase2()`; JSON público con forma
`{ id, evento, partida, sistema, descripcion, fecha, hora, fotoUrl, ciudad, mazmorra:{nombre,direccion,mapsUrl}, narrador, lugaresDisponibles, concluido }` (desaparecen `nombre`, `sede`, `guildmaster`).

- [ ] **Step 1:** En `config.js`, reemplazar `HOJAS` y `ENCABEZADOS` por:

```js
var HOJAS = {
  ciudades: 'Ciudades',
  sedes: 'Sedes',
  narradores: 'Narradores',
  nombresEventos: 'NombresEventos',
  sistemas: 'Sistemas',
  eventos: 'Eventos',
  registros: 'Registros',
  vista: 'Eventos del mes',
};

var ENCABEZADOS = {
  Ciudades: ['id', 'nombre'],
  Sedes: ['id', 'ciudadId', 'nombre', 'direccion', 'mapsUrl'],
  Narradores: ['id', 'nombre'],
  NombresEventos: ['id', 'nombre'],
  Sistemas: ['id', 'nombre'],
  Eventos: ['id', 'nombreEventoId', 'partida', 'sistemaId', 'descripcion', 'fecha', 'hora', 'sedeId', 'narradorId', 'fotoUrl', 'cupo'],
  Registros: ['id', 'eventoId', 'nombre', 'telefono', 'correo', 'timestamp'],
};
```

- [ ] **Step 2:** En `instalar.js` agregar al final (instalar() queda igual — ya crea lo que falte):

```js
// FASE 2: borra las pestañas de datos viejas (todo era utilería) y reinstala el esquema nuevo.
// Correr UNA VEZ desde el editor tras el push de fase 2.
function resetFase2() {
  var ss = SpreadsheetApp.getActive();
  ['Ciudades', 'Sedes', 'Guildmasters', 'Narradores', 'NombresEventos', 'Sistemas', 'Eventos', 'Registros']
    .forEach(function (nombre) {
      var h = ss.getSheetByName(nombre);
      if (h) ss.deleteSheet(h);
    });
  instalar();
  regenerarVista();
}
```

- [ ] **Step 3:** En `api.js`, `eventosPublicos_()` pasa a unir los cinco catálogos:

```js
function eventosPublicos_() {
  var ahora = ahoraIso_();
  var hoy = ahora.slice(0, 10);
  var ciudades = indicePorId_(leerTabla(HOJAS.ciudades));
  var sedes = indicePorId_(leerTabla(HOJAS.sedes));
  var narradores = indicePorId_(leerTabla(HOJAS.narradores));
  var nombres = indicePorId_(leerTabla(HOJAS.nombresEventos));
  var sistemas = indicePorId_(leerTabla(HOJAS.sistemas));
  var registros = leerTabla(HOJAS.registros);
  return leerEventos_()
    .filter(function (ev) { return eventoVisible(ev, hoy); })
    .map(function (ev) {
      var sede = sedes[String(ev.sedeId)] || {};
      return {
        id: ev.id,
        evento: (nombres[String(ev.nombreEventoId)] || {}).nombre || '',
        partida: ev.partida,
        sistema: (sistemas[String(ev.sistemaId)] || {}).nombre || '',
        descripcion: ev.descripcion,
        fecha: ev.fecha,
        hora: ev.hora,
        fotoUrl: ev.fotoUrl || '',
        ciudad: (ciudades[String(sede.ciudadId)] || {}).nombre || '',
        mazmorra: { nombre: sede.nombre || '', direccion: sede.direccion || '', mapsUrl: sede.mapsUrl || '' },
        narrador: (narradores[String(ev.narradorId)] || {}).nombre || '',
        lugaresDisponibles: lugaresDisponibles(ev, registros),
        concluido: eventoConcluido(ev, ahora),
      };
    })
    .sort(function (a, b) { return a.fecha + a.hora < b.fecha + b.hora ? -1 : 1; });
}
```

- [ ] **Step 4:** `pruebas.js`: actualizar `sembrarDatosDePrueba()` al esquema nuevo (crea 1 ciudad-sede-narrador-nombreEvento-sistema y 1 ejecución con partida "Partida de prueba"). `probarCorreo` sin cambios.
- [ ] **Step 5:** `node --check` de los 4 archivos + `node --test apps-script/tests/*.test.js` (12/12; logic.js no cambia) + `clasp push -f` + commit `feat(eventos): esquema fase 2 — catálogos de eventos, sistemas y narradores`.

---

### Task 2: Panel — catálogos, formulario nuevo y anti doble-clic

**Files:** Modify: `apps-script/admin.js`, `apps-script/panel.html`

**Interfaces:** Produces: `panelDatos()` devuelve además `narradores`, `nombresEventos`, `sistemas` (ya no `guildmasters`); `panelCrear`/`panelEditar`/`panelBorrar` aceptan las tablas nuevas.

- [ ] **Step 1:** `admin.js`:
  - `panelDatos` lee las 7 pestañas de datos.
  - `panelCrear`: (a) **guard de nombre duplicado en catálogos** — para tablas `ciudades`, `sedes`, `narradores`, `nombresEventos`, `sistemas`: si ya existe fila con el mismo `nombre` (trim, case-insensitive) → `throw new Error('Ya existe ' + nombre + ' con ese nombre.')` (mensaje con el nombre de la tabla en singular está bien); (b) **regla de ejecuciones**: reemplazar el guard actual por bloqueo cuando coincidan **sedeId + fecha + hora** (sin importar nombre/partida): `'Esa mazmorra ya tiene una partida a esa hora.'`.
- [ ] **Step 2:** `panel.html`:
  - Formulario de ejecución en el orden del spec §4 (evento→partida→sistema→sede→narrador→fecha→hora→descripción→foto), selects poblados de los catálogos nuevos; etiquetas "Narrador", "Mazmorra (sede)".
  - Dos secciones nuevas de catálogo: "Nombres de eventos" y "Sistemas de juego" (form + lista con Borrar, como Ciudades).
  - Renombrar la sección/labels de Guildmasters → Narradores.
  - **Anti doble-clic**: en `alta()` y en el submit de ejecución, deshabilitar el botón submit al entrar y rehabilitarlo en el `finally` (aplica también a los botones Borrar/Liberar vía deshabilitado durante `llamar`).
  - `editarEvento` carga los campos nuevos (incl. partida, sistemaId, nombreEventoId, narradorId).
- [ ] **Step 3:** checks + push + commit `feat(eventos): panel fase 2 — catálogos, partida y anti doble-clic`.
- [ ] **Step 4 (🔑 MANUAL Armando):** en el editor recargado correr `resetFase2` y luego `sembrarDatosDePrueba`; probar el panel vía URL `/dev` (crear catálogos, ejecución completa con foto, editar, doble-clic a Crear ciudad ya no duplica, nombre repetido rechazado).

---

### Task 3: Vista bonita y correo

**Files:** Modify: `apps-script/vista.js`, `apps-script/mail.js`

- [ ] **Step 1:** `vista.js`: barra superior = `evento — partida — sistema — fecha hora — mazmorra (ciudad) — Narrador: X`; renglón de columnas sin "No.": `['Lugar', 'Nombre', 'Teléfono', 'Correo']` (4 columnas; ajustar merges y anchos).
- [ ] **Step 2:** `mail.js`: cuerpo con `Evento:`, `Partida:`, `Sistema:`, `Narrador:`, `Mazmorra:` (+ dirección, mapa, ciudad, fecha/hora, descripción). Asunto: `Tu registro: <partida> — <fecha>`.
- [ ] **Step 3:** checks + push + commit `feat(eventos): vista y correo con evento, partida, sistema y mazmorra`.

---

### Task 4: Archivado y borrado mensual automático

**Files:** Create: `apps-script/archivo.js`

- [ ] **Step 1:** Escribir:

```js
// Respaldo y limpieza mensual. El disparador corre el día 1 de cada mes de madrugada.
var CARPETA_RESPALDOS = 'Forjadores — Respaldos';

function archivarMesVencido() {
  var ss = SpreadsheetApp.getActive();
  var hoyIso = Utilities.formatDate(new Date(), CONFIG.zonaHoraria, 'yyyy-MM-dd');
  var mesActual = hoyIso.slice(0, 7);
  var vencidos = leerEventos_().filter(function (ev) { return ev.fecha.slice(0, 7) < mesActual; });
  if (vencidos.length === 0) return;

  // 1. SIEMPRE respaldar antes de borrar: copia completa de la hoja a la carpeta de respaldos.
  var carpetas = DriveApp.getFoldersByName(CARPETA_RESPALDOS);
  var carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(CARPETA_RESPALDOS);
  var mesRespaldado = vencidos[0].fecha.slice(0, 7);
  DriveApp.getFileById(ss.getId()).makeCopy('Eventos ' + mesRespaldado, carpeta);

  // 2. Borrar ejecuciones vencidas y sus registros.
  vencidos.forEach(function (ev) {
    leerTabla(HOJAS.registros)
      .filter(function (r) { return String(r.eventoId) === String(ev.id); })
      .forEach(function (r) { borrarFilaPorId(HOJAS.registros, r.id); });
    borrarFilaPorId(HOJAS.eventos, ev.id);
  });
  regenerarVista();
}

// Correr UNA VEZ (por cuenta) desde el editor para instalar el disparador mensual.
function crearDisparadorMensual() {
  var existe = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'archivarMesVencido';
  });
  if (existe) return;
  ScriptApp.newTrigger('archivarMesVencido').timeBased().onMonthDay(1).atHour(3).create();
}
```

- [ ] **Step 2:** agregar scope `"https://www.googleapis.com/auth/script.scriptapp"` a `appsscript.json` (los triggers lo requieren).
- [ ] **Step 3:** checks + push + commit `feat(eventos): respaldo mensual automático antes del borrado de eventos vencidos`.
- [ ] **Step 4 (🔑 MANUAL Armando):** correr `crearDisparadorMensual` (autorizar el permiso nuevo) y UNA corrida manual de `archivarMesVencido` (con un evento de prueba fechado el mes pasado, creado a mano vía panel con fecha vieja — el panel lo permite) para verificar: copia en "Forjadores — Respaldos" + filas borradas + vista regenerada.

---

### Task 5: Sitio — reestructura, hero y tarjeta nueva

**Files:** Modify: `src/pages/index.astro`, `src/components/Eventos.astro`, `src/layouts/BaseLayout.astro` (solo si el flotante vive ahí), `src/components/Footer.astro`

- [ ] **Step 1:** `index.astro`:
  - `<Eventos />` pasa a ser la PRIMERA sección tras el hero.
  - Eliminar: sección "Qué incluye tu sesión" (y su data `incluye` + imports no usados), sección del mapa "Encuéntranos en el Barrio de Analco", y el bloque `{MOSTRAR_PRECIOS…}`/`{MOSTRAR_BANQUETE…}` se conserva tal cual (flags apagados, no estorban).
  - Hero nuevo (aprueba Armando en revisión):
    - H1: `Cada tirada de dados forja una leyenda` (se conserva).
    - Párrafo: `Partidas abiertas de Dungeons & Dragons y otros juegos de rol en las mazmorras de Puebla, Ciudad de México y Guadalajara. Elige tu mesa, aparta tu lugar y llega a jugar: el narrador se encarga del resto.`
  - CTA final: `<a href="#eventos">` con clases del botón primario (igual que el hero); quitar `<WhatsAppButton>` de la página y el import si queda sin uso.
  - JSON-LD `description`: `Comunidad de juegos de rol con partidas abiertas en Puebla, Ciudad de México y Guadalajara.`
  - `SITE.description` NO se toca en esta task (se revisa en Task 8 si hace falta).
- [ ] **Step 2:** quitar el botón flotante de WhatsApp (`<FloatingWhatsApp>` — localizar dónde se monta, probablemente BaseLayout o index) y el enlace de WhatsApp del `Footer.astro` (leer el archivo; quitar SOLO WhatsApp, el resto del footer se queda).
- [ ] **Step 3:** `Eventos.astro` — `tarjeta()` nueva con el JSON de fase 2:
  - Eyebrow/badge: `evento` + chip `sistema` (ambos arriba de la tarjeta, estilos parchment).
  - Título: `partida` (font-display, como hoy el nombre).
  - Fecha/hora igual que hoy; `Narrador: <strong>X</strong>`; `Mazmorra: <strong>Y</strong> — cómo llegar` (enlace `mazmorra.mapsUrl`); descripción completa (sin truncar); cupos y botón igual.
  - Modal (`abrirRegistro`): título = partida; subtítulo con evento · fecha · hora · mazmorra, ciudad.
  - El intro de la sección: `Partidas abiertas de rol en las mazmorras de cada ciudad. Aparta tu lugar y llega a jugar: el narrador se encarga del resto.`
- [ ] **Step 4:** `npm run build` sin errores; verificación en navegador (controlador). Commit `feat(eventos): fase 2 en el sitio — eventos al frente, partida/sistema/mazmorra, adiós WhatsApp y mapa`.

---

### Task 6: Aviso de privacidad — contacto ARCO por correo

**Files:** Modify: `src/pages/aviso-de-privacidad.astro`

- [ ] Sustituir el párrafo de derechos ARCO: quitar WhatsApp y teléfono; poner `escribiéndonos a <a href="mailto:forjadoresdeleyendas@gmail.com">forjadoresdeleyendas@gmail.com</a>`. Build + commit `fix: contacto ARCO del aviso de privacidad por correo del colectivo`.

---

### Task 7: Migración a la cuenta forjadoresdeleyendas@gmail.com (🔑 mayormente MANUAL)

Precondición: tasks 1–6 aprobadas y probadas en la cuenta de Armando.

- [ ] **Step 1:** `config.js`: `adminEmails: ['forjadoresdeleyendas@gmail.com']` (+ push + commit). A partir de aquí el panel de la cuenta vieja niega acceso — esperado.
- [ ] **Step 2 (🔑 Armando, navegador con sesión del negocio):** hacer **copia** de la hoja (Archivo → Hacer una copia) desde la cuenta forjadoresdeleyendas@gmail.com → la copia lleva el script pegado.
- [ ] **Step 3 (🔑 Armando, en el editor de la COPIA):** correr `resetFase2` (autorizar todos los permisos), `crearDisparadorMensual`; Configuración → propiedades → `RECAPTCHA_SECRET` (mismo valor); crear los 2 despliegues (API pública: Cualquier persona / Panel admin: Solo yo) y pasar ambas URLs.
- [ ] **Step 4:** actualizar `EVENTOS_API` en `src/lib/eventos-config.ts` con la URL nueva + build + prueba e2e (registro real de Armando → correo debe llegar DESDE forjadoresdeleyendas@gmail.com) + commit.
- [ ] **Step 5:** documentar en el reporte: URLs nuevas, y que la hoja/carpetas viejas de la cuenta de Armando quedan como respaldo hasta post-lanzamiento.

---

### Task 8: Cierre — limpieza, revisión final de rama y publicación

- [ ] Datos de prueba fuera (panel de la cuenta nueva); `node --test apps-script/tests/*.test.js && npm run build`.
- [ ] Actualizar `docs/ESTADO-DEL-SITIO.md` (fase 2: terminología, cuenta del negocio, URLs, disparador mensual, advertencia solo-lectura del Excel, workflow clasp post-migración).
- [ ] Revisión final de rama completa (modelo más capaz) + fixes.
- [ ] Screenshots promocionales para Pollo (SendUserFile a Armando).
- [ ] Con OK de Armando: push a main → Action → hPanel Desplegar → verificación en vivo.
