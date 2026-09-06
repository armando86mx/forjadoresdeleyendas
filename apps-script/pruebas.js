// Datos de prueba para desarrollo. Correr desde el editor. Borrar filas al terminar las pruebas.
function sembrarDatosDePrueba() {
  var puebla = leerTabla(HOJAS.ciudades).filter(function (c) { return c.nombre === 'Puebla'; })[0];
  var sedeId = nuevoId_();
  agregarFila(HOJAS.sedes, {
    id: sedeId, ciudadId: puebla.id, nombre: 'Forjadores de Leyendas',
    direccion: 'C. 12 Sur 908-1, Barrio de Analco, Puebla',
    mapsUrl: 'https://maps.google.com/?q=C.+12+Sur+908-1+Barrio+de+Analco+Puebla',
  });
  var gmId = nuevoId_();
  agregarFila(HOJAS.guildmasters, { id: gmId, nombre: 'Pollo Rolero' });
  var fecha = Utilities.formatDate(new Date(Date.now() + 7 * 24 * 3600 * 1000), CONFIG.zonaHoraria, 'yyyy-MM-dd');
  agregarFila(HOJAS.eventos, {
    id: nuevoId_(), nombre: 'La cripta del posadero', descripcion: 'Aventura de prueba, nivel 1.',
    fecha: fecha, hora: '16:00', sedeId: sedeId, guildmasterId: gmId, fotoUrl: '', cupo: CONFIG.cupoPorEvento,
  });
}

function probarCorreo() {
  var evento = leerTabla(HOJAS.eventos)[0];
  enviarConfirmaciones_(evento.id, [
    { nombre: 'Prueba', correo: Session.getActiveUser().getEmail(), telefono: '2220000000' },
  ]);
}
