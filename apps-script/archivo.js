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
