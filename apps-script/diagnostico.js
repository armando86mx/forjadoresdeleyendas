// Diagnóstico temporal. Correr desde el editor y revisar el Registro de ejecución.
// Dice qué hoja/pestañas/datos ve el script y con qué usuario corre. Borrar tras usar.
function diagnostico() {
  var ss = SpreadsheetApp.getActive();
  var out = {
    usuarioActivo: Session.getActiveUser().getEmail(),
    usuarioEfectivo: Session.getEffectiveUser().getEmail(),
    adminEmails: CONFIG.adminEmails,
    hojaId: ss.getId(),
    hojaNombre: ss.getName(),
    pestanas: ss.getSheets().map(function (s) { return s.getName() + '(' + s.getLastRow() + ')'; }),
    conteos: {
      ciudades: leerTabla(HOJAS.ciudades).length,
      sedes: leerTabla(HOJAS.sedes).length,
      narradores: leerTabla(HOJAS.narradores).length,
      nombresEventos: leerTabla(HOJAS.nombresEventos).length,
      sistemas: leerTabla(HOJAS.sistemas).length,
      eventos: leerTabla(HOJAS.eventos).length,
      registros: leerTabla(HOJAS.registros).length,
    },
  };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}
