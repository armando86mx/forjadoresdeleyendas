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
  if (tabla === 'eventos') {
    fila.cupo = CONFIG.cupoPorEvento;
    // Un evento idéntico solo puede ser un accidente (doble clic, semilla repetida).
    var duplicado = leerEventos_().some(function (ev) {
      return ev.nombre === fila.nombre && String(ev.sedeId) === String(fila.sedeId) &&
        ev.fecha === fila.fecha && ev.hora === fila.hora;
    });
    if (duplicado) throw new Error('Ya existe un evento con ese nombre, sede, fecha y hora.');
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
  var carpetas = DriveApp.getFoldersByName(CONFIG.carpetaFotos);
  var carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(CONFIG.carpetaFotos);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', nombreArchivo);
  var archivo = carpeta.createFile(blob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // Truco tolerado, no CDN formal (spec §7): si el tráfico crece, migrar estas fotos.
  return 'https://lh3.googleusercontent.com/d/' + archivo.getId();
}
