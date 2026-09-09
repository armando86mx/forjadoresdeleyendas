// Correr UNA VEZ desde el editor de Apps Script para crear pestañas y semillas.
function instalar() {
  var ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(CONFIG.zonaHoraria); // la hoja nació con otra zona; alinearla con el script
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
