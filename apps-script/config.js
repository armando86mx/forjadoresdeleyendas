// Configuración global. La hoja no necesita ID: el script está pegado a ella.
var CONFIG = {
  cupoPorEvento: 6,
  adminEmails: ['juanarmandoaguilargalindo@gmail.com'], // al traspasar a Pollo: cambiar por su cuenta
  recaptchaMinScore: 0.5,
  carpetaFotos: 'Forjadores — Fotos de eventos',
  zonaHoraria: 'America/Mexico_City',
};

var HOJAS = {
  ciudades: 'Ciudades',
  sedes: 'Sedes',
  narradores: 'Narradores',
  nombresEventos: 'NombresEventos',
  sistemas: 'Sistemas',
  eventos: 'Eventos',
  registros: 'Registros',
  vista: 'Eventos del mes',
};

var ENCABEZADOS = {
  Ciudades: ['id', 'nombre'],
  Sedes: ['id', 'ciudadId', 'nombre', 'direccion', 'mapsUrl'],
  Narradores: ['id', 'nombre'],
  NombresEventos: ['id', 'nombre'],
  Sistemas: ['id', 'nombre'],
  Eventos: ['id', 'nombreEventoId', 'partida', 'sistemaId', 'descripcion', 'fecha', 'hora', 'sedeId', 'narradorId', 'fotoUrl', 'cupo'],
  Registros: ['id', 'eventoId', 'nombre', 'telefono', 'correo', 'timestamp'],
};

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG, HOJAS: HOJAS, ENCABEZADOS: ENCABEZADOS };
