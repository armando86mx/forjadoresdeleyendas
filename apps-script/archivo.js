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
  var meses = {};
  vencidos.forEach(function (ev) { meses[ev.fecha.slice(0, 7)] = true; });
  var nombreRespaldo = 'Eventos ' + Object.keys(meses).sort().join(', ');
  DriveApp.getFileById(ss.getId()).makeCopy(nombreRespaldo, carpeta);

  // 2. Borrar ejecuciones vencidas y sus registros.
  var registros = leerTabla(HOJAS.registros);
  vencidos.forEach(function (ev) {
    registros
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
