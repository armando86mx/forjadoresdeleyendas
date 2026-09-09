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
    h.getRange(fila, 1, 1, 4).merge()
      .setValue(ev.evento + ' — ' + ev.partida + ' — ' + ev.sistema + ' — ' + ev.fecha + ' ' + ev.hora +
        ' — ' + ev.mazmorra.nombre + ' (' + ev.ciudad + ') — Narrador: ' + ev.narrador)
      .setBackground('#2b1f14').setFontColor('#f5ecd7').setFontWeight('bold');
    fila++;
    h.getRange(fila, 1, 1, 4).setValues([['Lugar', 'Nombre', 'Teléfono', 'Correo']])
      .setFontWeight('bold').setBackground('#e8dcc3');
    fila++;
    for (var i = 0; i < cupo; i++) {
      var r = delEvento[i];
      h.getRange(fila, 1, 1, 4).setValues([[
        'Lugar ' + (i + 1), r ? r.nombre : 'Disponible', r ? "'" + r.telefono : '', r ? r.correo : '',
      ]]).setBackground(r ? '#dbe8d0' : '#ffffff');
      fila++;
    }
    fila++; // separación entre eventos
  });
  h.setColumnWidth(1, 90).setColumnWidth(2, 220).setColumnWidth(3, 130).setColumnWidth(4, 220);
}
