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
  var fila = enc.map(function (col) { return obj[col] !== undefined ? obj[col] : ''; });
  // setValues (y no appendRow) para que el formato de texto '@' de las columnas
  // se respete y Sheets no convierta fechas/horas/teléfonos.
  h.getRange(h.getLastRow() + 1, 1, 1, fila.length).setValues([fila]);
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
