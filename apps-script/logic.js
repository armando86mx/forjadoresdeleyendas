// Lógica pura, sin servicios de Google: testeable en Node con `node --test`.

function mesDe(fechaIso) {
  return String(fechaIso).slice(0, 7); // 'YYYY-MM'
}

// Visible = su mes es el mes en curso o uno futuro (spec §4).
function eventoVisible(evento, hoyIso) {
  return mesDe(evento.fecha) >= mesDe(hoyIso);
}

// Concluido = su hora de inicio ya pasó. Comparación de strings ISO: correcta y sin Date.
function eventoConcluido(evento, ahoraIso) {
  return evento.fecha + ' ' + evento.hora <= ahoraIso;
}

function lugaresDisponibles(evento, registros) {
  var ocupados = registros.filter(function (r) { return String(r.eventoId) === String(evento.id); }).length;
  return Math.max(0, (Number(evento.cupo) || 6) - ocupados);
}

var RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normaliza cada persona IN PLACE y devuelve un mensaje de error o null.
function validarPersonas(personas) {
  if (!Array.isArray(personas) || personas.length < 1) return 'Registra al menos una persona.';
  var vistos = {};
  for (var i = 0; i < personas.length; i++) {
    var p = personas[i] || {};
    var nombre = String(p.nombre || '').trim();
    var correo = String(p.correo || '').trim().toLowerCase();
    var telefono = String(p.telefono || '').replace(/\D/g, '');
    if (nombre.length < 2) return 'Falta el nombre de la persona ' + (i + 1) + '.';
    if (nombre.length > 80) return 'El nombre de la persona ' + (i + 1) + ' es demasiado largo.';
    if (!RE_CORREO.test(correo)) return 'El correo de ' + nombre + ' no es válido.';
    if (correo.length > 254) return 'El correo de ' + nombre + ' es demasiado largo.';
    if (telefono.length !== 10) return 'El teléfono de ' + nombre + ' debe tener 10 dígitos.';
    if (vistos[correo]) return 'El correo ' + correo + ' está repetido en el formulario.';
    vistos[correo] = true;
    personas[i] = { nombre: nombre, correo: correo, telefono: telefono };
  }
  return null;
}

function validarRegistro(personas, evento, registrosDelEvento, ahoraIso) {
  if (!evento) return 'El evento ya no existe.';
  if (eventoConcluido(evento, ahoraIso)) return 'Este evento ya concluyó.';
  var errorPersonas = validarPersonas(personas);
  if (errorPersonas) return errorPersonas;
  var disponibles = lugaresDisponibles(evento, registrosDelEvento);
  if (personas.length > disponibles) {
    return disponibles === 0
      ? 'El cupo se llenó. ¡Nos vemos en el siguiente evento!'
      : 'Mientras llenabas el formulario se ocuparon lugares; quedan ' + disponibles + '.';
  }
  var existentes = {};
  registrosDelEvento.forEach(function (r) { existentes[String(r.correo).toLowerCase()] = true; });
  for (var i = 0; i < personas.length; i++) {
    if (existentes[personas[i].correo]) return 'El correo ' + personas[i].correo + ' ya está registrado en este evento.';
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    mesDe: mesDe,
    eventoVisible: eventoVisible,
    eventoConcluido: eventoConcluido,
    lugaresDisponibles: lugaresDisponibles,
    validarPersonas: validarPersonas,
    validarRegistro: validarRegistro,
  };
}
