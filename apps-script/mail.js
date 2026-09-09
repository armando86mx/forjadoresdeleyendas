function enviarConfirmaciones_(eventoId, personas) {
  var ev = eventosPublicos_().filter(function (x) { return String(x.id) === String(eventoId); })[0];
  if (!ev) return;
  personas.forEach(function (p) {
    var cuerpo = [
      '¡Saludos, ' + p.nombre + '! Tu lugar está reservado. Estos son los detalles de tu aventura:',
      '',
      'Evento: ' + ev.evento,
      'Partida: ' + ev.partida,
      'Sistema: ' + ev.sistema,
      'Fecha: ' + ev.fecha + ' a las ' + ev.hora + ' h',
      'Narrador: ' + ev.narrador,
      'Ciudad: ' + ev.ciudad,
      'Mazmorra: ' + ev.mazmorra.nombre,
      'Dirección: ' + ev.mazmorra.direccion,
      'Cómo llegar: ' + ev.mazmorra.mapsUrl,
      '',
      ev.descripcion,
      '',
      'Nos vemos en la mesa.',
      'Forjadores de Leyendas — ' + 'https://forjadoresdeleyendas.mx',
    ].join('\n');
    try {
      MailApp.sendEmail({
        to: p.correo,
        subject: 'Tu registro: ' + ev.partida + ' — ' + ev.fecha,
        body: cuerpo,
        name: 'Forjadores de Leyendas',
      });
    } catch (err) {
      // Un correo fallido no debe tirar un registro ya guardado en la hoja.
      console.error('Correo fallido para ' + p.correo + ': ' + err);
    }
  });
}
