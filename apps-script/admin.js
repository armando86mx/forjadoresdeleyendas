// Toda función del panel empieza con exigirAdmin_(): defensa en profundidad.
// En el despliegue anónimo getActiveUser() devuelve vacío → nunca pasa el filtro.
function exigirAdmin_() {
  var quien = Session.getActiveUser().getEmail();
  if (CONFIG.adminEmails.indexOf(quien) === -1) throw new Error('Acceso denegado.');
}

function servirPanel_() {
  exigirAdmin_();
  return HtmlService.createHtmlOutputFromFile('panel')
    .setTitle('Forjadores — Eventos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Tablas de catálogo simple (id, nombre) donde el nombre no puede repetirse.
var TABLAS_CATALOGO_ = ['ciudades', 'sedes', 'narradores', 'nombresEventos', 'sistemas'];

function panelDatos() {
  exigirAdmin_();
  return {
    ciudades: leerTabla(HOJAS.ciudades),
    sedes: leerTabla(HOJAS.sedes),
    narradores: leerTabla(HOJAS.narradores),
    nombresEventos: leerTabla(HOJAS.nombresEventos),
    sistemas: leerTabla(HOJAS.sistemas),
    eventos: leerTabla(HOJAS.eventos),
    registros: leerTabla(HOJAS.registros),
  };
}

// true si alguna ejecución (distinta de excluirId) ya ocupa esa mazmorra a esa hora.
function chocaEjecucion_(fila, excluirId) {
  return leerEventos_().some(function (ev) {
    if (excluirId !== undefined && String(ev.id) === String(excluirId)) return false;
    return String(ev.sedeId) === String(fila.sedeId) && ev.fecha === fila.fecha && ev.hora === fila.hora;
  });
}

function panelCrear(tabla, obj) {
  exigirAdmin_();
  var nombre = HOJAS[tabla];
  if (!nombre || tabla === 'registros' || tabla === 'vista') throw new Error('Tabla inválida.');
  var fila = { id: nuevoId_() };
  var enc = ENCABEZADOS[nombre];
  enc.forEach(function (col) { if (obj[col] !== undefined) fila[col] = String(obj[col]).trim(); });
  ['mapsUrl', 'fotoUrl'].forEach(function (campo) {
    var v = fila[campo];
    if (v && String(v).indexOf('https://') !== 0) throw new Error('El enlace de ' + campo + ' debe iniciar con https://');
  });
  if (TABLAS_CATALOGO_.indexOf(tabla) !== -1) {
    // Un catálogo con nombre repetido solo puede ser un accidente (doble clic, error de captura).
    var nombreNuevo = String(fila.nombre).trim().toLowerCase();
    var duplicado = leerTabla(nombre).some(function (f) { return String(f.nombre).trim().toLowerCase() === nombreNuevo; });
    if (duplicado) throw new Error('Ya existe ' + fila.nombre + ' con ese nombre.');
  }
  if (tabla === 'eventos') {
    fila.cupo = CONFIG.cupoPorEvento;
    // Dos partidas no caben en la misma mazmorra a la misma hora, sin importar el nombre.
    if (chocaEjecucion_(fila)) throw new Error('Esa mazmorra ya tiene una partida a esa hora.');
  }
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
  ['mapsUrl', 'fotoUrl'].forEach(function (campo) {
    var v = limpio[campo];
    if (v && String(v).indexOf('https://') !== 0) throw new Error('El enlace de ' + campo + ' debe iniciar con https://');
  });
  if (tabla === 'eventos' && limpio.sedeId !== undefined && limpio.fecha !== undefined && limpio.hora !== undefined) {
    if (chocaEjecucion_(limpio, id)) throw new Error('Esa mazmorra ya tiene una partida a esa hora.');
  }
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

function panelGuardarFoto(base64, nombreArchivo) {
  exigirAdmin_();
  var carpeta = carpetaSegura_(CONFIG.carpetaFotos);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', nombreArchivo);
  var archivo = carpeta.createFile(blob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // Truco tolerado, no CDN formal (spec §7): si el tráfico crece, migrar estas fotos.
  return 'https://lh3.googleusercontent.com/d/' + archivo.getId();
}
