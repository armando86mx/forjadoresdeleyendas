function ahoraIso_() {
  return Utilities.formatDate(new Date(), CONFIG.zonaHoraria, 'yyyy-MM-dd HH:mm');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function indicePorId_(filas) {
  var idx = {};
  filas.forEach(function (f) { idx[String(f.id)] = f; });
  return idx;
}

function textoFecha_(v) {
  return (v instanceof Date)
    ? Utilities.formatDate(v, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'yyyy-MM-dd')
    : String(v);
}

function textoHora_(v) {
  return (v instanceof Date)
    ? Utilities.formatDate(v, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'HH:mm')
    : String(v);
}

// Eventos con fecha/hora garantizadas como texto ('yyyy-MM-dd' / 'HH:mm'): aunque
// Sheets haya convertido la celda a Date, aquí se recupera el texto original.
function leerEventos_() {
  return leerTabla(HOJAS.eventos).map(function (ev) {
    ev.fecha = textoFecha_(ev.fecha);
    ev.hora = textoHora_(ev.hora);
    return ev;
  });
}

function doGet(e) {
  if (e && e.parameter && e.parameter.panel === '1') return servirPanel_(); // Task 8
  return json_({ ok: true, eventos: eventosPublicos_() });
}

function eventosPublicos_() {
  var ahora = ahoraIso_();
  var hoy = ahora.slice(0, 10);
  var ciudades = indicePorId_(leerTabla(HOJAS.ciudades));
  var sedes = indicePorId_(leerTabla(HOJAS.sedes));
  var gms = indicePorId_(leerTabla(HOJAS.guildmasters));
  var registros = leerTabla(HOJAS.registros);
  return leerEventos_()
    .filter(function (ev) { return eventoVisible(ev, hoy); })
    .map(function (ev) {
      var sede = sedes[String(ev.sedeId)] || {};
      return {
        id: ev.id,
        nombre: ev.nombre,
        descripcion: ev.descripcion,
        fecha: ev.fecha,
        hora: ev.hora,
        fotoUrl: ev.fotoUrl || '',
        ciudad: (ciudades[String(sede.ciudadId)] || {}).nombre || '',
        sede: { nombre: sede.nombre || '', direccion: sede.direccion || '', mapsUrl: sede.mapsUrl || '' },
        guildmaster: (gms[String(ev.guildmasterId)] || {}).nombre || '',
        lugaresDisponibles: lugaresDisponibles(ev, registros),
        concluido: eventoConcluido(ev, ahora),
      };
    })
    .sort(function (a, b) { return a.fecha + a.hora < b.fecha + b.hora ? -1 : 1; });
}

function doPost(e) {
  var datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Solicitud inválida.' });
  }

  // Honeypot: un humano nunca ve este campo; si viene lleno es un bot. Fingimos éxito.
  if (datos.apellido2) return json_({ ok: true });

  if (!verificarRecaptcha_(datos.recaptchaToken)) {
    return json_({ ok: false, error: 'No pudimos verificar que eres humano. Recarga la página e intenta de nuevo.' });
  }

  var candado = LockService.getScriptLock();
  try {
    candado.waitLock(10000);
  } catch (err) {
    return json_({ ok: false, error: 'El tablón está muy solicitado. Intenta de nuevo en un momento.' });
  }
  var personas = datos.personas || [];
  try {
    var evento = leerEventos_().filter(function (ev) { return String(ev.id) === String(datos.eventoId); })[0];
    var registrosDelEvento = leerTabla(HOJAS.registros).filter(function (r) { return String(r.eventoId) === String(datos.eventoId); });
    var error = validarRegistro(personas, evento, registrosDelEvento, ahoraIso_());
    if (error) {
      return json_({
        ok: false,
        error: error,
        lugaresDisponibles: evento ? lugaresDisponibles(evento, registrosDelEvento) : 0,
      });
    }
    personas.forEach(function (p) {
      agregarFila(HOJAS.registros, {
        id: nuevoId_(), eventoId: evento.id,
        nombre: p.nombre, telefono: p.telefono, correo: p.correo,
        timestamp: ahoraIso_(),
      });
    });
    regenerarVista();
  } finally {
    candado.releaseLock();
  }
  enviarConfirmaciones_(datos.eventoId, personas); // fuera del candado: el correo es lento
  return json_({ ok: true });
}

function verificarRecaptcha_(token) {
  var secreto = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
  // Modo desarrollo: sin secreto configurado no se exige CAPTCHA. La Task 11
  // configura el secreto real; en producción SIEMPRE debe estar presente.
  if (!secreto) return true;
  if (!token) return false;
  try {
    var resp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: secreto, response: token },
      muteHttpExceptions: true,
    });
    var r = JSON.parse(resp.getContentText());
    return !!r.success && (r.score === undefined || r.score >= CONFIG.recaptchaMinScore);
  } catch (err) {
    // Falla de red hacia siteverify: doPost debe responder JSON bien formado, no una página de error.
    console.error('Verificación reCAPTCHA falló: ' + err);
    return false;
  }
}
