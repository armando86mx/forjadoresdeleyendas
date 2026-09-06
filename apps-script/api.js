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

function textoFecha_(v) {
  return (v instanceof Date)
    ? Utilities.formatDate(v, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'yyyy-MM-dd')
    : String(v);
}

function textoHora_(v) {
  return (v instanceof Date)
    ? Utilities.formatDate(v, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'HH:mm')
    : String(v);
}

// Eventos con fecha/hora garantizadas como texto ('yyyy-MM-dd' / 'HH:mm'): aunque
// Sheets haya convertido la celda a Date, aquí se recupera el texto original.
function leerEventos_() {
  return leerTabla(HOJAS.eventos).map(function (ev) {
    ev.fecha = textoFecha_(ev.fecha);
    ev.hora = textoHora_(ev.hora);
    return ev;
  });
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
  return leerEventos_()
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
