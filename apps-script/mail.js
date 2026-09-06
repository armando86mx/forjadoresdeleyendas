function enviarConfirmaciones_(eventoId, personas) {
  var ev = eventosPublicos_().filter(function (x) { return String(x.id) === String(eventoId); })[0];
  if (!ev) return;
  var cuerpo = [
    '¡Tu lugar está reservado! Estos son los detalles de tu aventura:',
    '',
    'Evento: ' + ev.nombre,
    'Fecha: ' + ev.fecha + ' a las ' + ev.hora + ' h',
    'Guildmaster: ' + ev.guildmaster,
    'Ciudad: ' + ev.ciudad,
    'Sede: ' + ev.sede.nombre,
    'Dirección: ' + ev.sede.direccion,
    'Cómo llegar: ' + ev.sede.mapsUrl,
    '',
    ev.descripcion,
    '',
    'Nos vemos en la mesa.',
    'Forjadores de Leyendas — ' + 'https://forjadoresdeleyendas.mx',
  ].join('\n');
  personas.forEach(function (p) {
    try {
      MailApp.sendEmail({
        to: p.correo,
        subject: 'Tu registro: ' + ev.nombre + ' — ' + ev.fecha,
        body: cuerpo,
        name: 'Forjadores de Leyendas',
      });
    } catch (err) {
      // Un correo fallido no debe tirar un registro ya guardado en la hoja.
      console.error('Correo fallido para ' + p.correo + ': ' + err);
    }
  });
}
