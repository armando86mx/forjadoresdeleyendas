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
