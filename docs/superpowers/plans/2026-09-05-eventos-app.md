# Plan de implementación — Aplicación de gestión de eventos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sección `#eventos` en la home que muestra eventos mensuales de D&D en vivo desde Google Sheets, con registro público validado (cupo 6, reCAPTCHA, correo de confirmación) y panel de administración privado para Pollo.

**Architecture:** El sitio Astro sigue 100% estático en Hostinger; los datos viven en una hoja de Google nueva y el backend es Apps Script pegado a ella (API pública `doGet`/`doPost` + panel admin HTML). El código de Apps Script vive en el repo bajo `apps-script/` y se publica con `clasp`. Spec: `docs/superpowers/specs/2026-09-05-eventos-app-design.md`.

**Tech Stack:** Astro 7 · Tailwind 4 · Google Apps Script (V8) · clasp 2.4.2 · Google Sheets/Drive/MailApp · reCAPTCHA v3 · `node --test` para lógica pura.

## Global Constraints

- Cuenta de desarrollo: la de Armando (`armandomx86@gmail.com`); el traspaso a Pollo es posterior a este plan (spec §9).
- Cupo fijo por evento: **6**. Zona horaria: **America/Mexico_City** en todo cálculo de fechas.
- Visibilidad de eventos: mes en curso y meses futuros; "Evento concluido" cuando la hora de inicio pasó; "Cupo completo" cuando `lugaresDisponibles === 0` (spec §4).
- POST al backend con `Content-Type: text/plain;charset=utf-8` (JSON en el cuerpo) — con `application/json` el navegador manda preflight OPTIONS y Apps Script no lo soporta (falla CORS).
- Voz de marca: posadero carismático, español de México, tutea. **"Forjadores" siempre con O.**
- Accesibilidad WCAG 2.1 AA: contraste 4.5:1, foco visible, áreas táctiles 44px, `alt` en imágenes.
- CSS propio solo dentro de `@layer base` o `@layer components` (`src/styles/global.css`).
- Nunca reintroducir `force_orphan` en el workflow. No hacer `git push` sin que Armando lo pida.
- Pasos marcados **🔑 MANUAL (Armando)** requieren su navegador/cuenta Google; el ejecutor se detiene y los pide.
- En Apps Script no hay módulos ES: los `.js` comparten espacio global. El guard `if (typeof module !== 'undefined')` al final de cada archivo compartido permite testearlo en Node sin romper Apps Script.

---

### Task 1: Migración Astro 5 → 7 + sharp ≥ 0.35

**Files:**
- Modify: `package.json`, `package-lock.json` (vía herramienta de upgrade)
- Posibles ajustes menores en `astro.config.mjs` / páginas si la guía de migración lo exige

**Interfaces:**
- Consumes: nada.
- Produces: sitio compilando en Astro 7; base para el resto de tasks.

- [ ] **Step 1: Correr la herramienta oficial de upgrade**

```bash
npx @astrojs/upgrade
```

Aceptar la actualización de `astro` y de las integraciones que proponga.

- [ ] **Step 2: Actualizar sharp y reinstalar**

```bash
npm install sharp@latest
npm install
npm ls astro sharp
```

Expected: `astro@7.x`, `sharp@0.35` o mayor.

- [ ] **Step 3: Compilar y corregir rupturas**

```bash
npm run build
```

Expected: `Complete!` sin errores. Si hay errores de API, consultar la guía oficial (https://docs.astro.build/en/guides/upgrade-to/v7/) y aplicar el cambio mínimo. No refactorizar nada que compile.

- [ ] **Step 4: Verificación visual**

```bash
npm run preview
```

Abrir `http://localhost:4321/`, `/cronicas/`, `/faq`, una crónica y `/404`: mismo aspecto que producción (hero, tarjetas, footer). Cerrar el preview.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src
git commit -m "chore: migrar a Astro 7 y sharp 0.35+ (deuda técnica previa a eventos)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Andamiaje Apps Script — hoja nueva, clasp, pestañas

**Files:**
- Create: `apps-script/.claspignore`, `apps-script/appsscript.json`, `apps-script/config.js`, `apps-script/sheets.js`, `apps-script/instalar.js`
- Create (lo genera clasp): `apps-script/.clasp.json`

**Interfaces:**
- Consumes: nada.
- Produces: hoja de Google con pestañas `Ciudades`, `Sedes`, `Guildmasters`, `Eventos`, `Registros`, `Eventos del mes`; globals `CONFIG`, `HOJAS`, `ENCABEZADOS`; helpers `leerTabla(nombre)`, `agregarFila(nombre, obj)`, `borrarFilaPorId(nombre, id)`, `actualizarFilaPorId(nombre, id, obj)` — todos usados por las tasks 4–9.

- [ ] **Step 1: 🔑 MANUAL (Armando) — habilitar la API de Apps Script y loguear clasp**

1. Abrir https://script.google.com/home/usersettings y activar "API de Google Apps Script".
2. En la terminal, en la raíz del repo:

```bash
npx @google/clasp@2.4.2 login
```

Se abre el navegador; autorizar con `armandomx86@gmail.com`. Expected: `Authorization successful.`

- [ ] **Step 2: Crear la hoja + script pegado**

```bash
mkdir -p apps-script && cd apps-script
npx @google/clasp@2.4.2 create --type sheets --title "Forjadores — Eventos"
```

Expected: crea una hoja de cálculo en el Drive de Armando y escribe `.clasp.json` (con `scriptId` y `parentId`) y `appsscript.json`. Ambos se commitean (no son secretos).

- [ ] **Step 3: Escribir `apps-script/.claspignore`**

```
**/**
!appsscript.json
!*.js
!*.html
```

(Push solo de los archivos raíz del proyecto; `tests/` y `node_modules` quedan fuera.)

- [ ] **Step 4: Escribir `apps-script/appsscript.json`** (sobreescribir el generado)

```json
{
  "timeZone": "America/Mexico_City",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

Nota: sin campo `webapp` — el acceso se elige por despliegue (la API pública y el panel usan configuraciones distintas, tasks 4 y 8).

- [ ] **Step 5: Escribir `apps-script/config.js`**

```js
// Configuración global. La hoja no necesita ID: el script está pegado a ella.
var CONFIG = {
  cupoPorEvento: 6,
  adminEmails: ['armandomx86@gmail.com'], // al traspasar a Pollo: cambiar por su cuenta
  recaptchaMinScore: 0.5,
  carpetaFotos: 'Forjadores — Fotos de eventos',
  zonaHoraria: 'America/Mexico_City',
};

var HOJAS = {
  ciudades: 'Ciudades',
  sedes: 'Sedes',
  guildmasters: 'Guildmasters',
  eventos: 'Eventos',
  registros: 'Registros',
  vista: 'Eventos del mes',
};

var ENCABEZADOS = {
  Ciudades: ['id', 'nombre'],
  Sedes: ['id', 'ciudadId', 'nombre', 'direccion', 'mapsUrl'],
  Guildmasters: ['id', 'nombre'],
  Eventos: ['id', 'nombre', 'descripcion', 'fecha', 'hora', 'sedeId', 'guildmasterId', 'fotoUrl', 'cupo'],
  Registros: ['id', 'eventoId', 'nombre', 'telefono', 'correo', 'timestamp'],
};

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, HOJAS: HOJAS, ENCABEZADOS: ENCABEZADOS };
```

- [ ] **Step 6: Escribir `apps-script/sheets.js`**

```js
function hoja_(nombre) {
  return SpreadsheetApp.getActive().getSheetByName(nombre);
}

function leerTabla(nombre) {
  var valores = hoja_(nombre).getDataRange().getValues();
  var enc = valores.shift();
  return valores
    .filter(function (fila) { return fila[0] !== ''; })
    .map(function (fila) {
      var obj = {};
      enc.forEach(function (col, i) { obj[col] = fila[i]; });
      return obj;
    });
}

function agregarFila(nombre, obj) {
  var h = hoja_(nombre);
  var enc = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
  h.appendRow(enc.map(function (col) { return obj[col] !== undefined ? obj[col] : ''; }));
}

function borrarFilaPorId(nombre, id) {
  var h = hoja_(nombre);
  var valores = h.getDataRange().getValues();
  for (var i = valores.length - 1; i >= 1; i--) {
    if (String(valores[i][0]) === String(id)) { h.deleteRow(i + 1); return true; }
  }
  return false;
}

function actualizarFilaPorId(nombre, id, obj) {
  var h = hoja_(nombre);
  var valores = h.getDataRange().getValues();
  var enc = valores[0];
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === String(id)) {
      var fila = enc.map(function (col, c) { return obj[col] !== undefined ? obj[col] : valores[i][c]; });
      h.getRange(i + 1, 1, 1, enc.length).setValues([fila]);
      return true;
    }
  }
  return false;
}

function nuevoId_() {
  return Utilities.getUuid().slice(0, 8);
}
```

- [ ] **Step 7: Escribir `apps-script/instalar.js`**

```js
// Correr UNA VEZ desde el editor de Apps Script para crear pestañas y semillas.
function instalar() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(ENCABEZADOS).forEach(function (nombre) {
    var h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    // Todo como texto plano: evita que Sheets "corrija" fechas, horas y teléfonos.
    h.getRange('A:Z').setNumberFormat('@');
    if (h.getLastRow() === 0) h.appendRow(ENCABEZADOS[nombre]);
    h.setFrozenRows(1);
    if (h.getProtections(SpreadsheetApp.ProtectionType.SHEET).length === 0) {
      h.protect().setWarningOnly(true); // aviso al editar a mano, sin bloquear al dueño
    }
  });
  if (!ss.getSheetByName(HOJAS.vista)) ss.insertSheet(HOJAS.vista, 0);
  if (leerTabla(HOJAS.ciudades).length === 0) {
    agregarFila(HOJAS.ciudades, { id: nuevoId_(), nombre: 'Puebla' });
    agregarFila(HOJAS.ciudades, { id: nuevoId_(), nombre: 'Ciudad de México' });
  }
  var sobrante = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (sobrante && sobrante.getLastRow() === 0) ss.deleteSheet(sobrante);
}
```

- [ ] **Step 8: Subir y ejecutar la instalación**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f && npx @google/clasp@2.4.2 open
```

**🔑 MANUAL (Armando):** en el editor que se abre, elegir la función `instalar` → **Ejecutar** → autorizar los permisos la primera vez.

Expected: la hoja "Forjadores — Eventos" tiene las 6 pestañas, `Ciudades` con Puebla y Ciudad de México.

- [ ] **Step 9: Commit**

```bash
git add apps-script
git commit -m "feat(eventos): andamiaje de Apps Script — hoja, pestañas y helpers de datos

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Lógica pura con TDD (`logic.js`)

**Files:**
- Create: `apps-script/logic.js`
- Test: `apps-script/tests/logic.test.js`

**Interfaces:**
- Consumes: nada (funciones puras, sin servicios de Google).
- Produces: `mesDe(fechaIso)`, `eventoVisible(evento, hoyIso)` (hoyIso `'YYYY-MM-DD'`), `eventoConcluido(evento, ahoraIso)` (ahoraIso `'YYYY-MM-DD HH:mm'`), `lugaresDisponibles(evento, registros)`, `validarPersonas(personas)` (normaliza in-place; devuelve string de error o `null`), `validarRegistro(personas, evento, registrosDelEvento, ahoraIso)` (devuelve string de error o `null`). Usadas por tasks 4, 5 y 7.

- [ ] **Step 1: Escribir los tests que fallan — `apps-script/tests/logic.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  eventoVisible, eventoConcluido, lugaresDisponibles, validarPersonas, validarRegistro,
} = require('../logic.js');

const EV = { id: 'e1', fecha: '2026-09-29', hora: '16:00', cupo: 6 };
const persona = (n) => ({ nombre: 'Persona ' + n, correo: 'p' + n + '@mail.com', telefono: '2221234567' });
const registro = (n) => ({ id: 'r' + n, eventoId: 'e1', nombre: 'R' + n, correo: 'r' + n + '@mail.com', telefono: '2220000000' });

test('visible durante su mes aunque la fecha ya pasó', () => {
  assert.equal(eventoVisible(EV, '2026-09-30'), true);
});
test('visible si es de un mes futuro', () => {
  assert.equal(eventoVisible({ ...EV, fecha: '2026-10-03' }, '2026-09-05'), true);
});
test('oculto cuando su mes terminó', () => {
  assert.equal(eventoVisible(EV, '2026-10-01'), false);
});
test('concluido exactamente desde su hora de inicio', () => {
  assert.equal(eventoConcluido(EV, '2026-09-29 15:59'), false);
  assert.equal(eventoConcluido(EV, '2026-09-29 16:00'), true);
});
test('lugares disponibles descuenta solo registros de ese evento', () => {
  const regs = [registro(1), registro(2), { ...registro(3), eventoId: 'otro' }];
  assert.equal(lugaresDisponibles(EV, regs), 4);
});
test('valida teléfono de 10 dígitos y correo con forma real', () => {
  assert.match(validarPersonas([{ ...persona(1), telefono: '123' }]), /10 dígitos/);
  assert.match(validarPersonas([{ ...persona(1), correo: 'no-es-correo' }]), /no es válido/);
  assert.equal(validarPersonas([persona(1)]), null);
});
test('normaliza: recorta espacios, minúsculas en correo, solo dígitos en teléfono', () => {
  const p = [{ nombre: '  Ana  ', correo: ' ANA@Mail.com ', telefono: '(222) 123-4567' }];
  assert.equal(validarPersonas(p), null);
  assert.deepEqual(p[0], { nombre: 'Ana', correo: 'ana@mail.com', telefono: '2221234567' });
});
test('rechaza correo repetido dentro del mismo formulario', () => {
  assert.match(validarPersonas([persona(1), persona(1)]), /repetido/);
});
test('rechaza grupo mayor al cupo restante, con mensaje amable', () => {
  const regs = [registro(1), registro(2), registro(3), registro(4)];
  const err = validarRegistro([persona(1), persona(2), persona(3)], EV, regs, '2026-09-01 12:00');
  assert.match(err, /quedan 2/);
});
test('rechaza registro en evento concluido o lleno', () => {
  assert.match(validarRegistro([persona(1)], EV, [], '2026-09-29 16:01'), /concluyó/);
  const llenos = [1, 2, 3, 4, 5, 6].map(registro);
  assert.match(validarRegistro([persona(1)], EV, llenos, '2026-09-01 12:00'), /cupo se llenó/i);
});
test('rechaza correo ya registrado en el evento', () => {
  const err = validarRegistro([{ ...persona(1), correo: 'r1@mail.com' }], EV, [registro(1)], '2026-09-01 12:00');
  assert.match(err, /ya está registrado/);
});
test('registro válido devuelve null', () => {
  assert.equal(validarRegistro([persona(1), persona(2)], EV, [registro(1)], '2026-09-01 12:00'), null);
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

```bash
node --test apps-script/tests/*.test.js
```

Expected: FAIL — `Cannot find module '../logic.js'`.

- [ ] **Step 3: Escribir `apps-script/logic.js`**

```js
// Lógica pura, sin servicios de Google: testeable en Node con `node --test`.

function mesDe(fechaIso) {
  return String(fechaIso).slice(0, 7); // 'YYYY-MM'
}

// Visible = su mes es el mes en curso o uno futuro (spec §4).
function eventoVisible(evento, hoyIso) {
  return mesDe(evento.fecha) >= mesDe(hoyIso);
}

// Concluido = su hora de inicio ya pasó. Comparación de strings ISO: correcta y sin Date.
function eventoConcluido(evento, ahoraIso) {
  return evento.fecha + ' ' + evento.hora <= ahoraIso;
}

function lugaresDisponibles(evento, registros) {
  var ocupados = registros.filter(function (r) { return String(r.eventoId) === String(evento.id); }).length;
  return Math.max(0, (Number(evento.cupo) || 6) - ocupados);
}

var RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normaliza cada persona IN PLACE y devuelve un mensaje de error o null.
function validarPersonas(personas) {
  if (!Array.isArray(personas) || personas.length < 1) return 'Registra al menos una persona.';
  var vistos = {};
  for (var i = 0; i < personas.length; i++) {
    var p = personas[i] || {};
    var nombre = String(p.nombre || '').trim();
    var correo = String(p.correo || '').trim().toLowerCase();
    var telefono = String(p.telefono || '').replace(/\D/g, '');
    if (nombre.length < 2) return 'Falta el nombre de la persona ' + (i + 1) + '.';
    if (!RE_CORREO.test(correo)) return 'El correo de ' + nombre + ' no es válido.';
    if (telefono.length !== 10) return 'El teléfono de ' + nombre + ' debe tener 10 dígitos.';
    if (vistos[correo]) return 'El correo ' + correo + ' está repetido en el formulario.';
    vistos[correo] = true;
    personas[i] = { nombre: nombre, correo: correo, telefono: telefono };
  }
  return null;
}

function validarRegistro(personas, evento, registrosDelEvento, ahoraIso) {
  if (!evento) return 'El evento ya no existe.';
  if (eventoConcluido(evento, ahoraIso)) return 'Este evento ya concluyó.';
  var errorPersonas = validarPersonas(personas);
  if (errorPersonas) return errorPersonas;
  var disponibles = lugaresDisponibles(evento, registrosDelEvento);
  if (personas.length > disponibles) {
    return disponibles === 0
      ? 'El cupo se llenó. ¡Nos vemos en el siguiente evento!'
      : 'Mientras llenabas el formulario se ocuparon lugares; quedan ' + disponibles + '.';
  }
  var existentes = {};
  registrosDelEvento.forEach(function (r) { existentes[String(r.correo).toLowerCase()] = true; });
  for (var i = 0; i < personas.length; i++) {
    if (existentes[personas[i].correo]) return 'El correo ' + personas[i].correo + ' ya está registrado en este evento.';
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    mesDe: mesDe,
    eventoVisible: eventoVisible,
    eventoConcluido: eventoConcluido,
    lugaresDisponibles: lugaresDisponibles,
    validarPersonas: validarPersonas,
    validarRegistro: validarRegistro,
  };
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

```bash
node --test apps-script/tests/*.test.js
```

Expected: `pass 12`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add apps-script/logic.js apps-script/tests/logic.test.js
git commit -m "feat(eventos): lógica pura de visibilidad, cupos y validación con tests

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: API pública `doGet` + datos de prueba + despliegue

**Files:**
- Create: `apps-script/api.js`, `apps-script/pruebas.js`

**Interfaces:**
- Consumes: `leerTabla`, `agregarFila`, `nuevoId_` (Task 2); `eventoVisible`, `eventoConcluido`, `lugaresDisponibles` (Task 3).
- Produces: endpoint GET que responde `{ ok: true, eventos: [...] }` donde cada evento es `{ id, nombre, descripcion, fecha:'YYYY-MM-DD', hora:'HH:mm', fotoUrl, ciudad, sede:{nombre,direccion,mapsUrl}, guildmaster, lugaresDisponibles:number, concluido:boolean }` ordenado por fecha+hora. Helpers `ahoraIso_()`, `json_(obj)`, `eventosPublicos_()`, `indicePorId_(filas)` para tasks 5–8. La **URL del despliegue público** (`…/exec`) que consumen las tasks 10 y 11.

- [ ] **Step 1: Escribir `apps-script/api.js`**

```js
function ahoraIso_() {
  return Utilities.formatDate(new Date(), CONFIG.zonaHoraria, 'yyyy-MM-dd HH:mm');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function indicePorId_(filas) {
  var idx = {};
  filas.forEach(function (f) { idx[String(f.id)] = f; });
  return idx;
}

function doGet(e) {
  if (e && e.parameter && e.parameter.panel === '1') return servirPanel_(); // Task 8
  return json_({ ok: true, eventos: eventosPublicos_() });
}

function eventosPublicos_() {
  var ahora = ahoraIso_();
  var hoy = ahora.slice(0, 10);
  var ciudades = indicePorId_(leerTabla(HOJAS.ciudades));
  var sedes = indicePorId_(leerTabla(HOJAS.sedes));
  var gms = indicePorId_(leerTabla(HOJAS.guildmasters));
  var registros = leerTabla(HOJAS.registros);
  return leerTabla(HOJAS.eventos)
    .filter(function (ev) { return eventoVisible(ev, hoy); })
    .map(function (ev) {
      var sede = sedes[String(ev.sedeId)] || {};
      return {
        id: ev.id,
        nombre: ev.nombre,
        descripcion: ev.descripcion,
        fecha: ev.fecha,
        hora: ev.hora,
        fotoUrl: ev.fotoUrl || '',
        ciudad: (ciudades[String(sede.ciudadId)] || {}).nombre || '',
        sede: { nombre: sede.nombre || '', direccion: sede.direccion || '', mapsUrl: sede.mapsUrl || '' },
        guildmaster: (gms[String(ev.guildmasterId)] || {}).nombre || '',
        lugaresDisponibles: lugaresDisponibles(ev, registros),
        concluido: eventoConcluido(ev, ahora),
      };
    })
    .sort(function (a, b) { return a.fecha + a.hora < b.fecha + b.hora ? -1 : 1; });
}
```

Nota: `servirPanel_` aún no existe (Task 8); Apps Script no falla por referencias dentro de funciones no llamadas.

- [ ] **Step 2: Escribir `apps-script/pruebas.js`**

```js
// Datos de prueba para desarrollo. Correr desde el editor. Borrar filas al terminar las pruebas.
function sembrarDatosDePrueba() {
  var puebla = leerTabla(HOJAS.ciudades).filter(function (c) { return c.nombre === 'Puebla'; })[0];
  var sedeId = nuevoId_();
  agregarFila(HOJAS.sedes, {
    id: sedeId, ciudadId: puebla.id, nombre: 'Forjadores de Leyendas',
    direccion: 'C. 12 Sur 908-1, Barrio de Analco, Puebla',
    mapsUrl: 'https://maps.google.com/?q=C.+12+Sur+908-1+Barrio+de+Analco+Puebla',
  });
  var gmId = nuevoId_();
  agregarFila(HOJAS.guildmasters, { id: gmId, nombre: 'Pollo Rolero' });
  var fecha = Utilities.formatDate(new Date(Date.now() + 7 * 24 * 3600 * 1000), CONFIG.zonaHoraria, 'yyyy-MM-dd');
  agregarFila(HOJAS.eventos, {
    id: nuevoId_(), nombre: 'La cripta del posadero', descripcion: 'Aventura de prueba, nivel 1.',
    fecha: fecha, hora: '16:00', sedeId: sedeId, guildmasterId: gmId, fotoUrl: '', cupo: CONFIG.cupoPorEvento,
  });
}
```

- [ ] **Step 3: Subir y sembrar**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f && npx @google/clasp@2.4.2 open
```

**🔑 MANUAL (Armando):** en el editor, correr `sembrarDatosDePrueba`.

- [ ] **Step 4: 🔑 MANUAL (Armando) — crear el despliegue público**

En el editor: **Implementar → Nueva implementación → Aplicación web** con:
- Descripción: `API pública`
- Ejecutar como: **Yo**
- Quién tiene acceso: **Cualquier persona** (la opción anónima, sin inicio de sesión)

Copiar la **URL que termina en `/exec`** y pegarla en la conversación.

- [ ] **Step 5: Probar el endpoint**

```bash
curl -sL "URL_EXEC_PUBLICA" | python3 -m json.tool
```

Expected: `{"ok": true, "eventos": [ { "nombre": "La cripta del posadero", "ciudad": "Puebla", "lugaresDisponibles": 6, "concluido": false, ... } ]}`.

- [ ] **Step 6: Commit**

```bash
git add apps-script/api.js apps-script/pruebas.js
git commit -m "feat(eventos): endpoint público de eventos (doGet) y datos de prueba

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Vista bonita (`Eventos del mes`)

**Files:**
- Create: `apps-script/vista.js`

**Interfaces:**
- Consumes: `eventosPublicos_` (Task 4), `leerTabla`, `HOJAS` (Task 2).
- Produces: `regenerarVista()` — reconstruye la pestaña `Eventos del mes`. La llaman `doPost` (Task 7) y el panel (Task 8).

- [ ] **Step 1: Escribir `apps-script/vista.js`**

```js
// Reconstruye la pestaña "Eventos del mes": la vista humana de solo lectura (spec §3).
// Cualquier edición manual en esa pestaña se pierde aquí — es a propósito.
function regenerarVista() {
  var ss = SpreadsheetApp.getActive();
  var h = ss.getSheetByName(HOJAS.vista) || ss.insertSheet(HOJAS.vista, 0);
  // breakApart antes de clear: clear() NO deshace celdas combinadas, y los merges
  // huérfanos de regeneraciones anteriores desalinearían filas futuras.
  h.getRange(1, 1, h.getMaxRows(), h.getMaxColumns()).breakApart();
  h.clear();
  var registros = leerTabla(HOJAS.registros);
  var fila = 1;
  eventosPublicos_().forEach(function (ev) {
    var delEvento = registros.filter(function (r) { return String(r.eventoId) === String(ev.id); });
    var cupo = ev.lugaresDisponibles + delEvento.length;
    h.getRange(fila, 1, 1, 5).merge()
      .setValue(ev.nombre + ' — ' + ev.fecha + ' ' + ev.hora + ' — ' + ev.sede.nombre +
        ' (' + ev.ciudad + ') — GM: ' + ev.guildmaster)
      .setBackground('#2b1f14').setFontColor('#f5ecd7').setFontWeight('bold');
    fila++;
    // La columna "No." replica la hoja histórica de Pollo; su significado sigue pendiente (spec §11).
    h.getRange(fila, 1, 1, 5).setValues([['Lugar', 'No.', 'Nombre', 'Teléfono', 'Correo']])
      .setFontWeight('bold').setBackground('#e8dcc3');
    fila++;
    for (var i = 0; i < cupo; i++) {
      var r = delEvento[i];
      h.getRange(fila, 1, 1, 5).setValues([[
        'Lugar ' + (i + 1), '', r ? r.nombre : 'Disponible', r ? "'" + r.telefono : '', r ? r.correo : '',
      ]]).setBackground(r ? '#dbe8d0' : '#ffffff');
      fila++;
    }
    fila++; // separación entre eventos
  });
  h.setColumnWidth(1, 90).setColumnWidth(2, 60).setColumnWidth(3, 220).setColumnWidth(4, 130).setColumnWidth(5, 220);
}
```

- [ ] **Step 2: Subir y probar**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f
```

**🔑 MANUAL (Armando):** correr `regenerarVista` desde el editor y abrir la hoja.

Expected: la pestaña `Eventos del mes` muestra el evento de prueba con encabezado oscuro y 6 filas "Disponible".

- [ ] **Step 3: Commit**

```bash
git add apps-script/vista.js
git commit -m "feat(eventos): vista bonita regenerable en la pestaña Eventos del mes

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Correos de confirmación

**Files:**
- Create: `apps-script/mail.js`
- Modify: `apps-script/pruebas.js` (agregar `probarCorreo`)

**Interfaces:**
- Consumes: `eventosPublicos_` (Task 4).
- Produces: `enviarConfirmaciones_(eventoId, personas)` — la llama `doPost` (Task 7). `personas` = `[{nombre, correo, telefono}]` ya normalizadas.

- [ ] **Step 1: Escribir `apps-script/mail.js`**

```js
function enviarConfirmaciones_(eventoId, personas) {
  var ev = eventosPublicos_().filter(function (x) { return String(x.id) === String(eventoId); })[0];
  if (!ev) return;
  var cuerpo = [
    '¡Tu lugar está reservado! Estos son los detalles de tu aventura:',
    '',
    'Evento: ' + ev.nombre,
    'Fecha: ' + ev.fecha + ' a las ' + ev.hora + ' h',
    'Guildmaster: ' + ev.guildmaster,
    'Ciudad: ' + ev.ciudad,
    'Sede: ' + ev.sede.nombre,
    'Dirección: ' + ev.sede.direccion,
    'Cómo llegar: ' + ev.sede.mapsUrl,
    '',
    ev.descripcion,
    '',
    'Nos vemos en la mesa.',
    'Forjadores de Leyendas — ' + 'https://forjadoresdeleyendas.mx',
  ].join('\n');
  personas.forEach(function (p) {
    try {
      MailApp.sendEmail({
        to: p.correo,
        subject: 'Tu registro: ' + ev.nombre + ' — ' + ev.fecha,
        body: cuerpo,
        name: 'Forjadores de Leyendas',
      });
    } catch (err) {
      // Un correo fallido no debe tirar un registro ya guardado en la hoja.
      console.error('Correo fallido para ' + p.correo + ': ' + err);
    }
  });
}
```

- [ ] **Step 2: Agregar al final de `apps-script/pruebas.js`**

```js
function probarCorreo() {
  var evento = leerTabla(HOJAS.eventos)[0];
  enviarConfirmaciones_(evento.id, [
    { nombre: 'Prueba', correo: Session.getActiveUser().getEmail(), telefono: '2220000000' },
  ]);
}
```

- [ ] **Step 3: Subir y probar**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f
```

**🔑 MANUAL (Armando):** correr `probarCorreo` desde el editor y revisar su bandeja de entrada.

Expected: correo "Tu registro: La cripta del posadero — …" con todos los datos del evento.

- [ ] **Step 4: Commit**

```bash
git add apps-script/mail.js apps-script/pruebas.js
git commit -m "feat(eventos): correo de confirmación a cada persona registrada

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: `doPost` — registro con candado, honeypot y reCAPTCHA

**Files:**
- Modify: `apps-script/api.js` (agregar `doPost` y `verificarRecaptcha_`)

**Interfaces:**
- Consumes: `validarRegistro`, `lugaresDisponibles` (Task 3); `leerTabla`, `agregarFila`, `nuevoId_` (Task 2); `regenerarVista` (Task 5); `enviarConfirmaciones_` (Task 6); `ahoraIso_`, `json_` (Task 4).
- Produces: endpoint POST. Cuerpo esperado (JSON en texto plano): `{ eventoId, personas:[{nombre,telefono,correo}], recaptchaToken, apellido2:'' }` (`apellido2` = honeypot). Respuesta: `{ ok:true }` o `{ ok:false, error:string, lugaresDisponibles?:number }`. Lo consume el modal (Task 11).

- [ ] **Step 1: Agregar al final de `apps-script/api.js`**

```js
function doPost(e) {
  var datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Solicitud inválida.' });
  }

  // Honeypot: un humano nunca ve este campo; si viene lleno es un bot. Fingimos éxito.
  if (datos.apellido2) return json_({ ok: true });

  if (!verificarRecaptcha_(datos.recaptchaToken)) {
    return json_({ ok: false, error: 'No pudimos verificar que eres humano. Recarga la página e intenta de nuevo.' });
  }

  var candado = LockService.getScriptLock();
  try {
    candado.waitLock(10000);
  } catch (err) {
    return json_({ ok: false, error: 'El tablón está muy solicitado. Intenta de nuevo en un momento.' });
  }
  var personas = datos.personas || [];
  try {
    var evento = leerEventos_().filter(function (ev) { return String(ev.id) === String(datos.eventoId); })[0];
    var registrosDelEvento = leerTabla(HOJAS.registros).filter(function (r) { return String(r.eventoId) === String(datos.eventoId); });
    var error = validarRegistro(personas, evento, registrosDelEvento, ahoraIso_());
    if (error) {
      return json_({
        ok: false,
        error: error,
        lugaresDisponibles: evento ? lugaresDisponibles(evento, registrosDelEvento) : 0,
      });
    }
    personas.forEach(function (p) {
      agregarFila(HOJAS.registros, {
        id: nuevoId_(), eventoId: evento.id,
        nombre: p.nombre, telefono: p.telefono, correo: p.correo,
        timestamp: ahoraIso_(),
      });
    });
    regenerarVista();
  } finally {
    candado.releaseLock();
  }
  enviarConfirmaciones_(datos.eventoId, personas); // fuera del candado: el correo es lento
  return json_({ ok: true });
}

function verificarRecaptcha_(token) {
  var secreto = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
  // Modo desarrollo: sin secreto configurado no se exige CAPTCHA. La Task 11
  // configura el secreto real; en producción SIEMPRE debe estar presente.
  if (!secreto) return true;
  if (!token) return false;
  var resp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'post',
    payload: { secret: secreto, response: token },
    muteHttpExceptions: true,
  });
  var r = JSON.parse(resp.getContentText());
  return !!r.success && (r.score === undefined || r.score >= CONFIG.recaptchaMinScore);
}
```

- [ ] **Step 2: Subir y redes­plegar**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f
```

**🔑 MANUAL (Armando):** en el editor, **Implementar → Administrar implementaciones → editar la "API pública" → Versión: Nueva versión → Implementar** (la URL `/exec` no cambia).

- [ ] **Step 3: Probar registro feliz por curl** (tomar `EVENTO_ID` de la pestaña `Eventos`)

```bash
curl -sL -X POST "URL_EXEC_PUBLICA" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"eventoId":"EVENTO_ID","apellido2":"","personas":[{"nombre":"Ana Prueba","telefono":"2221112233","correo":"CORREO_DE_ARMANDO"}]}'
```

Expected: `{"ok":true}`; fila nueva en `Registros`; `Eventos del mes` muestra a Ana en Lugar 1; llega correo de confirmación.

- [ ] **Step 4: Probar rechazos**

```bash
# Duplicado (repetir el mismo curl del paso 3)
# Expected: {"ok":false,"error":"El correo … ya está registrado en este evento.","lugaresDisponibles":5}

# Honeypot
curl -sL -X POST "URL_EXEC_PUBLICA" -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"eventoId":"EVENTO_ID","apellido2":"bot","personas":[{"nombre":"Bot","telefono":"2220000000","correo":"bot@x.com"}]}'
# Expected: {"ok":true} — pero SIN fila nueva en Registros

# Teléfono inválido
curl -sL -X POST "URL_EXEC_PUBLICA" -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"eventoId":"EVENTO_ID","apellido2":"","personas":[{"nombre":"Beto","telefono":"123","correo":"beto@x.com"}]}'
# Expected: {"ok":false,"error":"El teléfono de Beto debe tener 10 dígitos.",...}
```

- [ ] **Step 5: Commit**

```bash
git add apps-script/api.js
git commit -m "feat(eventos): registro con candado, validación de cupo, honeypot y reCAPTCHA

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Panel de administración (CRUD)

**Files:**
- Create: `apps-script/admin.js`, `apps-script/admin.html`

**Interfaces:**
- Consumes: `leerTabla`, `agregarFila`, `borrarFilaPorId`, `actualizarFilaPorId`, `nuevoId_`, `CONFIG`, `HOJAS` (Task 2); `regenerarVista` (Task 5); `doGet` ya enruta `?panel=1` a `servirPanel_` (Task 4).
- Produces: funciones de servidor `panelDatos()`, `panelCrear(tabla, obj)`, `panelEditar(tabla, id, obj)`, `panelBorrar(tabla, id)` — `tabla` ∈ `'ciudades'|'sedes'|'guildmasters'|'eventos'|'registros'` (crear/editar no aplican a registros). `panelGuardarFoto` llega en Task 9. La **URL del despliegue admin**.

- [ ] **Step 1: Escribir `apps-script/admin.js`**

```js
// Toda función del panel empieza con exigirAdmin_(): defensa en profundidad.
// En el despliegue anónimo getActiveUser() devuelve vacío → nunca pasa el filtro.
function exigirAdmin_() {
  var quien = Session.getActiveUser().getEmail();
  if (CONFIG.adminEmails.indexOf(quien) === -1) throw new Error('Acceso denegado.');
}

function servirPanel_() {
  exigirAdmin_();
  return HtmlService.createHtmlOutputFromFile('admin')
    .setTitle('Forjadores — Eventos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function panelDatos() {
  exigirAdmin_();
  return {
    ciudades: leerTabla(HOJAS.ciudades),
    sedes: leerTabla(HOJAS.sedes),
    guildmasters: leerTabla(HOJAS.guildmasters),
    eventos: leerTabla(HOJAS.eventos),
    registros: leerTabla(HOJAS.registros),
  };
}

function panelCrear(tabla, obj) {
  exigirAdmin_();
  var nombre = HOJAS[tabla];
  if (!nombre || tabla === 'registros' || tabla === 'vista') throw new Error('Tabla inválida.');
  var fila = { id: nuevoId_() };
  var enc = ENCABEZADOS[nombre];
  enc.forEach(function (col) { if (obj[col] !== undefined) fila[col] = String(obj[col]).trim(); });
  if (tabla === 'eventos') fila.cupo = CONFIG.cupoPorEvento;
  agregarFila(nombre, fila);
  regenerarVista();
  return fila.id;
}

function panelEditar(tabla, id, obj) {
  exigirAdmin_();
  var nombre = HOJAS[tabla];
  if (!nombre || tabla === 'registros' || tabla === 'vista') throw new Error('Tabla inválida.');
  var limpio = {};
  ENCABEZADOS[nombre].forEach(function (col) {
    if (col !== 'id' && obj[col] !== undefined) limpio[col] = String(obj[col]).trim();
  });
  actualizarFilaPorId(nombre, id, limpio);
  regenerarVista();
}

function panelBorrar(tabla, id) {
  exigirAdmin_();
  var nombre = HOJAS[tabla];
  if (!nombre || tabla === 'vista') throw new Error('Tabla inválida.');
  borrarFilaPorId(nombre, id);
  if (tabla === 'eventos') {
    // Un evento borrado se lleva sus registros (spec: borrar evento manualmente).
    leerTabla(HOJAS.registros)
      .filter(function (r) { return String(r.eventoId) === String(id); })
      .forEach(function (r) { borrarFilaPorId(HOJAS.registros, r.id); });
  }
  regenerarVista();
}
```

- [ ] **Step 2: Escribir `apps-script/admin.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<base target="_top">
<meta charset="utf-8">
<title>Forjadores — Eventos</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0 auto; max-width: 640px; padding: 16px; background: #f7f2e7; color: #2b1f14; }
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1.05rem; margin-top: 28px; border-top: 2px solid #d8c9a8; padding-top: 16px; }
  form { display: grid; gap: 8px; margin: 12px 0; }
  input, select, textarea, button { font: inherit; padding: 10px; border: 1px solid #b9a77f; border-radius: 6px; }
  button { background: #a33b20; color: #fff; border: 0; cursor: pointer; }
  button.mini { background: #6b5b3e; padding: 6px 10px; font-size: .8rem; }
  ul { list-style: none; padding: 0; }
  li { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e5dcc5; align-items: center; }
  #estado { position: fixed; top: 0; left: 0; right: 0; background: #2b6b2f; color: #fff; padding: 8px; text-align: center; display: none; z-index: 9; }
</style>
</head>
<body>
<div id="estado"></div>
<h1>⚔️ Administración de eventos</h1>

<h2>Nuevo evento</h2>
<form id="f-evento">
  <input name="nombre" placeholder="Nombre del evento" required>
  <textarea name="descripcion" placeholder="Descripción de la aventura" rows="3" required></textarea>
  <select name="sedeId" id="sel-sede" required></select>
  <select name="guildmasterId" id="sel-gm" required></select>
  <input name="fecha" type="date" required>
  <input name="hora" type="time" required>
  <button>Crear evento</button>
</form>
<ul id="l-eventos"></ul>

<h2>Registros por evento</h2>
<select id="sel-evento-reg"></select>
<ul id="l-registros"></ul>

<h2>Sedes</h2>
<form id="f-sede">
  <select name="ciudadId" id="sel-ciudad" required></select>
  <input name="nombre" placeholder="Nombre de la sede" required>
  <input name="direccion" placeholder="Dirección" required>
  <input name="mapsUrl" type="url" placeholder="Enlace de Google Maps" required>
  <button>Crear sede</button>
</form>
<ul id="l-sedes"></ul>

<h2>Guildmasters</h2>
<form id="f-gm"><input name="nombre" placeholder="Nombre" required><button>Crear</button></form>
<ul id="l-gms"></ul>

<h2>Ciudades</h2>
<form id="f-ciudad"><input name="nombre" placeholder="Nombre" required><button>Crear</button></form>
<ul id="l-ciudades"></ul>

<script>
let D = { ciudades: [], sedes: [], guildmasters: [], eventos: [], registros: [] };

function avisar(msj) {
  const e = document.getElementById('estado');
  e.textContent = msj; e.style.display = 'block';
  setTimeout(() => { e.style.display = 'none'; }, 2500);
}
function llamar(fn, ...args) {
  return new Promise((res, rej) =>
    google.script.run
      .withSuccessHandler(res)
      .withFailureHandler((e) => { avisar('Error: ' + e.message); rej(e); })[fn](...args));
}
async function recargar() { D = await llamar('panelDatos'); pintar(); }

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function nombreDe(lista, id) { const x = lista.find((f) => String(f.id) === String(id)); return x ? x.nombre : '¿?'; }
function opciones(sel, filas, texto) {
  sel.innerHTML = filas.map((f) => `<option value="${esc(f.id)}">${esc(texto(f))}</option>`).join('');
}
function lista(id, filas, texto, tabla, verbo = 'Borrar') {
  document.getElementById(id).innerHTML = filas.map((f) =>
    `<li><span>${esc(texto(f))}</span><button class="mini" onclick="borrar('${tabla}','${esc(f.id)}')">${verbo}</button></li>`
  ).join('') || '<li>Sin datos.</li>';
}

function pintar() {
  opciones(document.getElementById('sel-ciudad'), D.ciudades, (f) => f.nombre);
  opciones(document.getElementById('sel-sede'), D.sedes, (f) => `${f.nombre} (${nombreDe(D.ciudades, f.ciudadId)})`);
  opciones(document.getElementById('sel-gm'), D.guildmasters, (f) => f.nombre);
  opciones(document.getElementById('sel-evento-reg'), D.eventos, (f) => `${f.nombre} — ${f.fecha}`);
  lista('l-ciudades', D.ciudades, (f) => f.nombre, 'ciudades');
  lista('l-gms', D.guildmasters, (f) => f.nombre, 'guildmasters');
  lista('l-sedes', D.sedes, (f) => `${f.nombre} — ${nombreDe(D.ciudades, f.ciudadId)}`, 'sedes');
  document.getElementById('l-eventos').innerHTML = D.eventos.map((f) =>
    `<li><span>${esc(`${f.nombre} — ${f.fecha} ${f.hora} — ${nombreDe(D.sedes, f.sedeId)}`)}</span>` +
    `<span><button class="mini" onclick="editarEvento('${esc(f.id)}')">Editar</button> ` +
    `<button class="mini" onclick="borrar('eventos','${esc(f.id)}')">Borrar</button></span></li>`
  ).join('') || '<li>Sin datos.</li>';
  pintarRegistros();
}
function pintarRegistros() {
  const evId = document.getElementById('sel-evento-reg').value;
  const filas = D.registros.filter((r) => String(r.eventoId) === String(evId));
  document.getElementById('l-registros').innerHTML = filas.map((r) =>
    `<li><span>${esc(r.nombre)} · ${esc(r.telefono)} · ${esc(r.correo)}</span>` +
    `<button class="mini" onclick="borrar('registros','${esc(r.id)}')">Liberar lugar</button></li>`
  ).join('') || '<li>Sin registros.</li>';
}
async function borrar(tabla, id) {
  if (!confirm('¿Seguro? Esta acción no se puede deshacer.')) return;
  await llamar('panelBorrar', tabla, id);
  avisar('Borrado.'); recargar();
}
document.getElementById('sel-evento-reg').onchange = pintarRegistros;

function alta(idForm, tabla, extra) {
  document.getElementById(idForm).onsubmit = async (ev) => {
    ev.preventDefault();
    const datos = Object.fromEntries(new FormData(ev.target));
    if (extra) Object.assign(datos, await extra());
    await llamar('panelCrear', tabla, datos);
    avisar('Guardado.'); ev.target.reset(); recargar();
  };
}
alta('f-ciudad', 'ciudades');
alta('f-gm', 'guildmasters');
alta('f-sede', 'sedes');

// El formulario de evento tiene modo crear/editar propio (no usa alta()).
let editandoEventoId = null;
function editarEvento(id) {
  const ev = D.eventos.find((f) => String(f.id) === String(id));
  if (!ev) return;
  editandoEventoId = id;
  const f = document.getElementById('f-evento');
  ['nombre', 'descripcion', 'sedeId', 'guildmasterId', 'fecha', 'hora'].forEach((c) => { f.elements[c].value = ev[c]; });
  f.querySelector('button:not(.mini)').textContent = 'Guardar cambios';
  f.scrollIntoView({ behavior: 'smooth' });
}
document.getElementById('f-evento').onsubmit = async (ev) => {
  ev.preventDefault();
  const datos = Object.fromEntries(new FormData(ev.target));
  if (editandoEventoId) {
    await llamar('panelEditar', 'eventos', editandoEventoId, datos);
  } else {
    await llamar('panelCrear', 'eventos', datos);
  }
  editandoEventoId = null;
  ev.target.querySelector('button:not(.mini)').textContent = 'Crear evento';
  avisar('Guardado.'); ev.target.reset(); recargar();
};

recargar();
</script>
</body>
</html>
```

- [ ] **Step 3: Subir**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f
```

- [ ] **Step 4: 🔑 MANUAL (Armando) — crear el despliegue del panel**

En el editor: **Implementar → Nueva implementación → Aplicación web** con:
- Descripción: `Panel admin`
- Ejecutar como: **Yo**
- Quién tiene acceso: **Solo yo**

Copiar la URL `/exec` de ESTE despliegue y abrir `URL_EXEC_ADMIN?panel=1` en el navegador (esa URL es la que Pollo guardará en favoritos). Si el editor no permitiera dos implementaciones con accesos distintos, avisar: el plan B es un segundo proyecto de script solo para el panel.

- [ ] **Step 5: Prueba funcional del panel**

En el panel: crear una ciudad "Prueba", una sede, un Guildmaster y un evento; verificar que aparecen en las pestañas y que `Eventos del mes` se regeneró. Con "Editar", cambiar la hora del evento y guardar; verificar la hora nueva en la pestaña `Eventos` y en la vista. Borrar un registro de prueba con "Liberar lugar" y confirmar que desaparece de `Registros` y de la vista. Verificar también que `curl -sL "URL_EXEC_PUBLICA?panel=1"` **no** devuelve el panel (responde error de acceso denegado).

- [ ] **Step 6: Commit**

```bash
git add apps-script/admin.js apps-script/admin.html
git commit -m "feat(eventos): panel de administración con CRUD y liberación de cupos

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Foto del evento (compresión + Drive)

**Files:**
- Modify: `apps-script/admin.js` (agregar `panelGuardarFoto`), `apps-script/admin.html` (input de foto + compresión)

**Interfaces:**
- Consumes: `exigirAdmin_` (Task 8), `CONFIG.carpetaFotos` (Task 2).
- Produces: `panelGuardarFoto(base64, nombreArchivo)` → devuelve URL pública `https://lh3.googleusercontent.com/d/<id>` que se guarda en `Eventos.fotoUrl` y consume la tarjeta (Task 10).

- [ ] **Step 1: Agregar al final de `apps-script/admin.js`**

```js
function panelGuardarFoto(base64, nombreArchivo) {
  exigirAdmin_();
  var carpetas = DriveApp.getFoldersByName(CONFIG.carpetaFotos);
  var carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(CONFIG.carpetaFotos);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', nombreArchivo);
  var archivo = carpeta.createFile(blob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // Truco tolerado, no CDN formal (spec §7): si el tráfico crece, migrar estas fotos.
  return 'https://lh3.googleusercontent.com/d/' + archivo.getId();
}
```

- [ ] **Step 2: En `apps-script/admin.html`, dentro de `#f-evento`, antes del `<button>`, agregar**

```html
  <input type="file" id="foto" accept="image/*">
```

- [ ] **Step 3: En el `<script>` de `admin.html`, dentro del handler `onsubmit` de `f-evento`, justo después de la línea `const datos = Object.fromEntries(new FormData(ev.target));`, agregar**

```js
  const fotoUrl = await subirFotoSiHay();
  if (fotoUrl) datos.fotoUrl = fotoUrl; // sin foto nueva, panelEditar conserva la existente
```

**y agregar al final del `<script>`:**

```js
async function subirFotoSiHay() {
  const archivo = document.getElementById('foto').files[0];
  if (!archivo) return '';
  avisar('Subiendo foto…');
  const img = await createImageBitmap(archivo);
  const escala = Math.min(1, 1200 / img.width); // ancho máx 1200px ≈ 150-250 KB en JPEG 0.8
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return llamar('panelGuardarFoto', dataUrl.split(',')[1], archivo.name.replace(/\.\w+$/, '') + '.jpg');
}
```

- [ ] **Step 4: Subir y probar**

```bash
cd apps-script && npx @google/clasp@2.4.2 push -f
```

**🔑 MANUAL (Armando):** recargar el panel, crear un evento con una foto de celular. Expected: en Drive aparece la carpeta "Forjadores — Fotos de eventos" con un JPEG < 500 KB; la fila del evento tiene `fotoUrl`; abrir esa URL en una ventana de incógnito muestra la imagen.

- [ ] **Step 5: Commit**

```bash
git add apps-script/admin.js apps-script/admin.html
git commit -m "feat(eventos): subida de foto del evento con compresión y Drive

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Sitio — sección `#eventos` (solo lectura)

**Files:**
- Create: `src/lib/eventos-config.ts`, `src/components/Eventos.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: el JSON de `doGet` (Task 4, forma exacta en sus Interfaces) desde `EVENTOS_API`.
- Produces: sección `#eventos` en la home con tarjetas agrupadas por ciudad y botones `.btn-registrar[data-id]` que la Task 11 conecta al modal; función global `window.__recargarEventos` para refrescar tras un registro.

- [ ] **Step 1: Escribir `src/lib/eventos-config.ts`** (con la URL real obtenida en Task 4)

```ts
// URL del despliegue "API pública" de Apps Script. Cambia al traspasar la cuenta a Pollo.
export const EVENTOS_API = 'PEGAR_URL_EXEC_PUBLICA';
// Clave de sitio de reCAPTCHA v3 (pública). Se configura en la Task 11; hasta entonces vacía.
export const RECAPTCHA_SITE_KEY = '';
```

- [ ] **Step 2: Escribir `src/components/Eventos.astro`**

```astro
---
import SectionTitle from '@/components/SectionTitle.astro';
---
<section id="eventos" class="scroll-mt-24 bg-parchment-light">
  <div class="mx-auto max-w-6xl px-4 py-16">
    <SectionTitle eyebrow="Eventos del mes" title="Únete a una mesa abierta" />
    <p class="mx-auto -mt-6 mb-10 max-w-prose text-center opacity-90">
      Partidas abiertas de rol en distintas sedes. Aparta tu lugar y llega a jugar: el Guildmaster se encarga del resto.
    </p>
    <div id="eventos-contenido" aria-live="polite">
      <p class="text-center opacity-70">Consultando el tablón de eventos…</p>
    </div>
  </div>
</section>

<script>
  import { EVENTOS_API } from '@/lib/eventos-config';

  const cont = document.getElementById('eventos-contenido')!;
  const esc = (s: unknown) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

  function fechaBonita(iso: string): string {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function horaBonita(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
  }

  function tarjeta(ev: any): string {
    const foto = ev.fotoUrl
      ? `<img src="${esc(ev.fotoUrl)}" alt="" loading="lazy" class="h-44 w-full object-cover">`
      : `<div class="flex h-44 w-full items-center justify-center bg-parchment-deep font-display text-5xl" aria-hidden="true">🎲</div>`;
    const accion = ev.concluido
      ? `<p class="mt-4 rounded-lg bg-parchment-deep px-4 py-3 text-center font-display font-bold opacity-70">Evento concluido</p>`
      : ev.lugaresDisponibles === 0
        ? `<p class="mt-4 rounded-lg bg-parchment-deep px-4 py-3 text-center font-display font-bold text-fire">Cupo completo</p>`
        : `<button type="button" data-id="${esc(ev.id)}" class="btn-registrar mt-4 w-full rounded-lg bg-fire px-6 py-3 font-display font-bold tracking-wide text-parchment-light transition-colors duration-200 hover:bg-amber hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2">Registrarse</button>`;
    const cupos = ev.concluido ? '' :
      `<p class="mt-3 text-sm font-bold ${ev.lugaresDisponibles === 0 ? 'text-fire' : 'text-wood'}">` +
      (ev.lugaresDisponibles === 0 ? 'Sin lugares disponibles' : `Quedan ${ev.lugaresDisponibles} de 6 lugares`) + '</p>';
    return `
      <article class="card flex flex-col overflow-hidden rounded-xl bg-parchment">
        ${foto}
        <div class="flex grow flex-col p-5">
          <h4 class="font-display text-lg font-bold text-wood">${esc(ev.nombre)}</h4>
          <p class="mt-1 text-sm font-bold capitalize">${esc(fechaBonita(ev.fecha))} · ${esc(horaBonita(ev.hora))}</p>
          <p class="mt-2 text-sm opacity-90">${esc(ev.descripcion)}</p>
          <p class="mt-3 text-sm">Guildmaster: <strong>${esc(ev.guildmaster)}</strong></p>
          <p class="text-sm">${esc(ev.sede.nombre)} — <a href="${esc(ev.sede.mapsUrl)}" target="_blank" rel="noopener" class="underline">cómo llegar</a></p>
          <div class="grow"></div>
          ${cupos}
          ${accion}
        </div>
      </article>`;
  }

  function pintar(eventos: any[]): void {
    if (eventos.length === 0) {
      cont.innerHTML = `<p class="text-center opacity-80">El posadero está preparando los eventos del mes. Vuelve pronto — o pregúntanos por <a class="underline" href="https://wa.me/522221890232" target="_blank" rel="noopener">WhatsApp</a>.</p>`;
      return;
    }
    const ciudades = [...new Set(eventos.map((ev) => ev.ciudad))];
    cont.innerHTML = ciudades.map((ciudad) => `
      <div class="mt-10 first:mt-0">
        <h3 class="ornament mb-6 text-center font-display text-2xl font-bold text-wood">${esc(ciudad)}</h3>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          ${eventos.filter((ev) => ev.ciudad === ciudad).map(tarjeta).join('')}
        </div>
      </div>`).join('');
  }

  async function cargar(): Promise<void> {
    try {
      const resp = await fetch(`${EVENTOS_API}?t=${Date.now()}`);
      const datos = await resp.json();
      if (!datos.ok) throw new Error('respuesta no ok');
      pintar(datos.eventos);
      document.dispatchEvent(new CustomEvent('eventos:pintados', { detail: datos.eventos }));
    } catch {
      cont.innerHTML = `<p class="text-center opacity-80">El tablón no responde por ahora. Escríbenos por <a class="underline" href="https://wa.me/522221890232" target="_blank" rel="noopener">WhatsApp</a> y te apartamos tu lugar.</p>`;
    }
  }

  (window as any).__recargarEventos = cargar;
  cargar();
</script>
```

- [ ] **Step 3: Modificar `src/pages/index.astro`**

1. En el frontmatter, después de `import SectionTitle…`, agregar:

```astro
import Eventos from '@/components/Eventos.astro';
```

2. En el hero, reemplazar el `<WhatsAppButton …label="Reserva tu aventura" />` (línea ~101) por un ancla con las mismas clases del botón primario:

```astro
<a
  href="#eventos"
  class="inline-block rounded-lg bg-fire px-6 py-3 font-display font-bold tracking-wide text-parchment-light no-underline transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:bg-amber hover:text-ink hover:shadow-md active:translate-y-px active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2"
>
  Reserva tu aventura
</a>
```

3. Insertar `<Eventos />` inmediatamente después del cierre `</section>` de "Qué incluye tu sesión" (línea ~156, antes del bloque `{MOSTRAR_PRECIOS && (`).

4. En la sección de team building, borrar el bloque del botón "Cotiza tu evento":

```astro
<div class="mt-8">
  <WhatsAppButton message="Hola, quiero cotizar una sesión especial o team building para mi equipo. 🏰" label="Cotiza tu evento" />
</div>
```

- [ ] **Step 4: Verificar en navegador**

```bash
npm run dev
```

En `http://localhost:4321/`: clic en "Reserva tu aventura" baja con ancla a la sección; la sección muestra el evento de prueba agrupado bajo "Puebla" con foto, fecha en español, cupos y botón "Registrarse" (aún sin acción); no existe el botón "Cotiza tu evento". Probar también con el dev server apagado de red (o URL rota temporal) que aparece el mensaje de plan B con WhatsApp. `npm run build` termina sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/lib/eventos-config.ts src/components/Eventos.astro src/pages/index.astro
git commit -m "feat(eventos): sección #eventos en la home con datos en vivo y ancla desde el hero

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Sitio — modal de registro + reCAPTCHA real

**Files:**
- Modify: `src/components/Eventos.astro` (dialog + lógica de registro), `src/lib/eventos-config.ts` (clave real)

**Interfaces:**
- Consumes: `doPost` (Task 7); botones `.btn-registrar[data-id]` y evento `eventos:pintados` (Task 10).
- Produces: flujo completo de registro en el sitio.

- [ ] **Step 1: 🔑 MANUAL (Armando) — claves de reCAPTCHA v3**

1. En https://www.google.com/recaptcha/admin/create registrar: etiqueta `Forjadores eventos`, tipo **reCAPTCHA v3**, dominios `forjadoresdeleyendas.mx` y `localhost`.
2. Copiar la **clave de sitio** (pública) a la conversación.
3. En el editor de Apps Script: **Configuración del proyecto → Propiedades de la secuencia de comandos → Agregar**: propiedad `RECAPTCHA_SECRET` = la **clave secreta**. (Con esto el modo desarrollo de la Task 7 queda apagado.)

- [ ] **Step 2: Poner la clave de sitio en `src/lib/eventos-config.ts`**

```ts
export const RECAPTCHA_SITE_KEY = 'CLAVE_DE_SITIO_REAL';
```

- [ ] **Step 3: En `src/components/Eventos.astro`, agregar el dialog después del cierre `</section>`**

```astro
<dialog id="registro-dialog" class="m-auto w-[min(92vw,28rem)] rounded-xl bg-parchment-light p-0 text-ink backdrop:bg-ink/70">
  <div class="max-h-[85vh] overflow-y-auto p-6">
    <div class="flex items-start justify-between gap-4">
      <h3 class="font-display text-xl font-bold text-wood" id="registro-titulo">Registro</h3>
      <button type="button" id="registro-cerrar" class="rounded p-2 text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber" aria-label="Cerrar">×</button>
    </div>
    <div id="registro-cuerpo"></div>
  </div>
</dialog>
```

- [ ] **Step 4: Agregar al final del `<script>` de `Eventos.astro`**

```ts
import { RECAPTCHA_SITE_KEY } from '@/lib/eventos-config';

const dialog = document.getElementById('registro-dialog') as HTMLDialogElement;
const cuerpo = document.getElementById('registro-cuerpo')!;
const titulo = document.getElementById('registro-titulo')!;
document.getElementById('registro-cerrar')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

let eventosCache: any[] = [];
document.addEventListener('eventos:pintados', (e: any) => {
  eventosCache = e.detail;
  document.querySelectorAll<HTMLButtonElement>('.btn-registrar').forEach((btn) => {
    btn.addEventListener('click', () => abrirRegistro(btn.dataset.id!));
  });
});

// Una sola promesa de carga: "existe window.grecaptcha" NO significa "está listo" —
// esperar siempre a grecaptcha.ready evita la carrera al enviar rápido el formulario.
let recaptchaListo: Promise<void> | null = null;
function cargarRecaptcha(): Promise<void> {
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve();
  if (!recaptchaListo) {
    recaptchaListo = new Promise((res) => {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      s.onload = () => (window as any).grecaptcha.ready(() => res());
      document.head.appendChild(s);
    });
  }
  return recaptchaListo;
}

function camposPersona(i: number): string {
  return `
    <fieldset class="mt-4 rounded-lg border border-wood/30 p-4">
      <legend class="px-1 font-display text-sm font-bold text-wood">Aventurero ${i + 1}</legend>
      <label class="mt-1 block text-sm">Nombre
        <input name="nombre-${i}" required minlength="2" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
      </label>
      <label class="mt-3 block text-sm">Teléfono (10 dígitos)
        <input name="telefono-${i}" type="tel" required pattern="[0-9() +-]{10,}" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
      </label>
      <label class="mt-3 block text-sm">Correo
        <input name="correo-${i}" type="email" required class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
      </label>
    </fieldset>`;
}

function abrirRegistro(id: string): void {
  const ev = eventosCache.find((x) => String(x.id) === String(id));
  if (!ev) return;
  titulo.textContent = ev.nombre;
  const max = Math.min(ev.lugaresDisponibles, 6);
  cuerpo.innerHTML = `
    <p class="mt-1 text-sm opacity-90">${esc(fechaBonita(ev.fecha))} · ${esc(horaBonita(ev.hora))} · ${esc(ev.sede.nombre)}, ${esc(ev.ciudad)}</p>
    <form id="registro-form" class="mt-2">
      <label class="mt-3 block text-sm">¿Cuántos lugares?
        <select name="cupos" class="mt-1 w-full rounded-lg border border-wood/40 bg-white px-3 py-2">
          ${Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
        </select>
      </label>
      <div id="registro-personas">${camposPersona(0)}</div>
      <!-- Honeypot: invisible para humanos; los bots lo llenan -->
      <div style="position:absolute;left:-5000px" aria-hidden="true">
        <input name="apellido2" tabindex="-1" autocomplete="off">
      </div>
      <p id="registro-error" class="mt-3 hidden rounded-lg bg-fire/10 px-3 py-2 text-sm font-bold text-fire" role="alert"></p>
      <button type="submit" class="mt-5 w-full rounded-lg bg-fire px-6 py-3 font-display font-bold tracking-wide text-parchment-light transition-colors hover:bg-amber hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber">Confirmar registro</button>
      <p class="mt-3 text-center text-xs opacity-70">Tus datos solo se usan para gestionar tu registro. <a href="/aviso-de-privacidad/" target="_blank" class="underline">Aviso de privacidad</a>.</p>
    </form>`;
  const form = document.getElementById('registro-form') as HTMLFormElement;
  form.querySelector<HTMLSelectElement>('[name=cupos]')!.addEventListener('change', (e) => {
    const n = Number((e.target as HTMLSelectElement).value);
    document.getElementById('registro-personas')!.innerHTML =
      Array.from({ length: n }, (_, i) => camposPersona(i)).join('');
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); enviar(ev, form); });
  dialog.showModal();
  cargarRecaptcha(); // precarga mientras el usuario escribe
}

async function enviar(ev: any, form: HTMLFormElement): Promise<void> {
  const boton = form.querySelector<HTMLButtonElement>('[type=submit]')!;
  const errorEl = document.getElementById('registro-error')!;
  errorEl.classList.add('hidden');
  boton.disabled = true;
  boton.textContent = 'Reservando lugares…';
  try {
    const datos = new FormData(form);
    const n = Number(datos.get('cupos'));
    const personas = Array.from({ length: n }, (_, i) => ({
      nombre: datos.get(`nombre-${i}`),
      telefono: datos.get(`telefono-${i}`),
      correo: datos.get(`correo-${i}`),
    }));
    await cargarRecaptcha();
    const w = window as any;
    const token = RECAPTCHA_SITE_KEY && w.grecaptcha
      ? await w.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'registro' })
      : '';
    const resp = await fetch(EVENTOS_API, {
      method: 'POST',
      // text/plain evita el preflight CORS que Apps Script no soporta
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ eventoId: ev.id, personas, recaptchaToken: token, apellido2: datos.get('apellido2') }),
    });
    const r = await resp.json();
    if (!r.ok) throw new Error(r.error || 'No pudimos guardar tu registro.');
    cuerpo.innerHTML = `
      <p class="mt-4 rounded-lg bg-parchment px-4 py-6 text-center">
        <strong class="font-display text-lg text-wood">¡Lugar reservado! 🎲</strong><br>
        <span class="mt-2 block text-sm opacity-90">Te enviamos un correo con todos los detalles del evento. Nos vemos en la mesa.</span>
      </p>`;
    (window as any).__recargarEventos();
  } catch (err: any) {
    errorEl.textContent = err.message || 'Algo salió mal. Intenta de nuevo.';
    errorEl.classList.remove('hidden');
    boton.disabled = false;
    boton.textContent = 'Confirmar registro';
    (window as any).__recargarEventos(); // refresca cupos visibles tras un rechazo
  }
}
```

- [ ] **Step 5: Prueba end-to-end en navegador**

```bash
npm run dev
```

En `http://localhost:4321/#eventos`:
1. Registrar 2 personas con correos reales de Armando → modal de éxito, filas en `Registros`, `Eventos del mes` actualizado, 2 correos recibidos, la tarjeta ahora dice "Quedan N−2".
2. Intentar registrar el mismo correo otra vez → error visible en el modal, cupos refrescados.
3. Llenar el evento hasta 6 → la tarjeta cambia a "Cupo completo" sin botón.
4. Desde el panel admin, "Liberar lugar" de uno → recargar el sitio: reaparece el botón "Registrarse".

Expected: los 4 flujos exactamente así. `npm run build` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/Eventos.astro src/lib/eventos-config.ts
git commit -m "feat(eventos): modal de registro con cupos, reCAPTCHA v3 invisible y estados de error

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Aviso de privacidad

**Files:**
- Create: `src/pages/aviso-de-privacidad.astro`

**Interfaces:**
- Consumes: `BaseLayout` (props `title`, `description`), `SITE` de `@/lib/site`. El modal (Task 11) ya enlaza a `/aviso-de-privacidad/`.
- Produces: página pública `/aviso-de-privacidad/`.

- [ ] **Step 1: Escribir `src/pages/aviso-de-privacidad.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import SectionTitle from '@/components/SectionTitle.astro';
import { SITE } from '@/lib/site';
---
<BaseLayout
  title="Aviso de privacidad — Forjadores de Leyendas"
  description="Cómo usamos y protegemos los datos que nos compartes al registrarte a un evento de Forjadores de Leyendas."
>
  <section class="bg-parchment-light">
    <div class="mx-auto max-w-3xl px-4 py-16">
      <SectionTitle title="Aviso de privacidad" />
      <div class="space-y-5 opacity-90">
        <p>
          <strong>Forjadores de Leyendas</strong>, con domicilio en {SITE.address.street},
          {SITE.address.neighborhood}, {SITE.address.city}, {SITE.address.state}, es responsable
          del tratamiento de los datos personales que nos compartes, conforme a la Ley Federal de
          Protección de Datos Personales en Posesión de los Particulares.
        </p>
        <p>
          <strong>Datos que recabamos:</strong> al registrarte a un evento te pedimos nombre,
          teléfono y correo electrónico de cada participante.
        </p>
        <p>
          <strong>Para qué los usamos:</strong> únicamente para gestionar tu registro, confirmarte
          los detalles del evento y contactarte si hay algún cambio. No los usamos para publicidad
          ni los compartimos con terceros.
        </p>
        <p>
          <strong>Dónde se guardan:</strong> en una hoja de cálculo privada de Google a la que solo
          accede el equipo organizador.
        </p>
        <p>
          <strong>Tus derechos:</strong> puedes pedir en cualquier momento el acceso, corrección o
          eliminación de tus datos (derechos ARCO) escribiéndonos por
          <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" class="underline">WhatsApp</a>
          al {SITE.phone}.
        </p>
        <p class="text-sm opacity-70">Última actualización: septiembre de 2026.</p>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verificar**

```bash
npm run build && npm run preview
```

Abrir `http://localhost:4321/aviso-de-privacidad/`: la página carga con el layout del sitio; el enlace del modal (Task 11) la abre.

- [ ] **Step 3: Commit**

```bash
git add src/pages/aviso-de-privacidad.astro
git commit -m "feat: página de aviso de privacidad para el registro de eventos

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Limpieza, verificación final y despliegue

**Files:**
- Modify: hoja de Google (datos de prueba), `docs/ESTADO-DEL-SITIO.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: sitio en producción con la sección de eventos viva.

- [ ] **Step 1: Limpiar datos de prueba**

Desde el panel admin: borrar los registros de prueba ("Ana Prueba", etc.) y, si estorban, los eventos/sedes/GMs de prueba (o conservarlos si Pollo los va a usar). Verificar que `Eventos del mes` quedó limpia.

- [ ] **Step 2: Corrida completa de checks**

```bash
node --test apps-script/tests/*.test.js && npm run build
```

Expected: tests en verde y build sin errores.

- [ ] **Step 3: Actualizar `docs/ESTADO-DEL-SITIO.md`**

Agregar al final de la sección "2. Stack y arquitectura":

```markdown
### Aplicación de eventos (2026-09)

- Sección `#eventos` en la home: datos en vivo desde Apps Script + Google Sheets
  (hoja "Forjadores — Eventos", hoy en la cuenta de Armando; traspaso a Pollo pendiente).
- Código del backend en `apps-script/` (se publica con `npx @google/clasp@2.4.2 push -f`
  y redespliegue manual de versión en el editor).
- Endpoint público y clave reCAPTCHA en `src/lib/eventos-config.ts`.
- Panel admin: URL del despliegue "Panel admin" + `?panel=1` (acceso: solo la cuenta dueña).
- Diseño y decisiones: `docs/superpowers/specs/2026-09-05-eventos-app-design.md`.
```

- [ ] **Step 4: Commit**

```bash
git add docs/ESTADO-DEL-SITIO.md
git commit -m "docs: registrar la aplicación de eventos en el estado del sitio

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: 🔑 MANUAL (Armando) — publicar**

1. Confirmar a Armando que todo está listo y pedir su OK para `git push origin main`.
2. Tras el push, la GitHub Action compila; luego Armando: hPanel → Avanzado → GIT → **Desplegar**.
3. Verificar en vivo `https://forjadoresdeleyendas.mx/#eventos`: sección cargando eventos reales, registro de prueba propio funcionando de punta a punta (y borrarlo después desde el panel).

---

## Notas para el ejecutor

- Las URLs `/exec`, la clave de sitio reCAPTCHA y el secreto se obtienen en las tasks 4, 8 y 11; los valores `PEGAR_…` de `eventos-config.ts` se rellenan en cuanto existen. No inventarlos.
- Si `clasp push` falla con error de autenticación, repetir `npx @google/clasp@2.4.2 login` (Task 2, Step 1).
- Los tests de `node --test` no requieren dependencias nuevas; no agregar frameworks de prueba.
- Cualquier desviación del comportamiento esperado en un step: detenerse y aplicar `superpowers:systematic-debugging`, no parchar a ciegas.
