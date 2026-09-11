const test = require('node:test');
const assert = require('node:assert/strict');
const {
  eventoVisible, eventoConcluido, lugaresDisponibles, validarPersonas, validarRegistro,
} = require('../logic.js');

const EV = { id: 'e1', fecha: '2026-09-29', hora: '16:00', cupo: 6 };
const persona = (n) => ({ nombre: 'Persona ' + n, correo: 'p' + n + '@mail.com', telefono: '2221234567' });
const registro = (n) => ({ id: 'r' + n, eventoId: 'e1', nombre: 'R' + n, correo: 'r' + n + '@mail.com', telefono: '2220000000' });

test('visible durante su mes aunque la fecha ya pasó', () => {
  assert.equal(eventoVisible(EV, '2026-09-30'), true);
});
test('visible si es de un mes futuro', () => {
  assert.equal(eventoVisible({ ...EV, fecha: '2026-10-03' }, '2026-09-05'), true);
});
test('oculto cuando su mes terminó', () => {
  assert.equal(eventoVisible(EV, '2026-10-01'), false);
});
test('concluido exactamente desde su hora de inicio', () => {
  assert.equal(eventoConcluido(EV, '2026-09-29 15:59'), false);
  assert.equal(eventoConcluido(EV, '2026-09-29 16:00'), true);
});
test('lugares disponibles descuenta solo registros de ese evento', () => {
  const regs = [registro(1), registro(2), { ...registro(3), eventoId: 'otro' }];
  assert.equal(lugaresDisponibles(EV, regs), 4);
});
test('valida teléfono de 10 dígitos y correo con forma real', () => {
  assert.match(validarPersonas([{ ...persona(1), telefono: '123' }]), /10 dígitos/);
  assert.match(validarPersonas([{ ...persona(1), correo: 'no-es-correo' }]), /no es válido/);
  assert.equal(validarPersonas([persona(1)]), null);
});
test('normaliza: recorta espacios, minúsculas en correo, solo dígitos en teléfono', () => {
  const p = [{ nombre: '  Ana  ', correo: ' ANA@Mail.com ', telefono: '(222) 123-4567' }];
  assert.equal(validarPersonas(p), null);
  assert.deepEqual(p[0], { nombre: 'Ana', correo: 'ana@mail.com', telefono: '2221234567' });
});
test('rechaza correo repetido dentro del mismo formulario', () => {
  assert.match(validarPersonas([persona(1), persona(1)]), /repetido/);
});
test('rechaza grupo mayor al cupo restante, con mensaje amable', () => {
  const regs = [registro(1), registro(2), registro(3), registro(4)];
  const err = validarRegistro([persona(1), persona(2), persona(3)], EV, regs, '2026-09-01 12:00');
  assert.match(err, /quedan 2/);
});
test('rechaza registro en evento concluido o lleno', () => {
  assert.match(validarRegistro([persona(1)], EV, [], '2026-09-29 16:01'), /concluyó/);
  const llenos = [1, 2, 3, 4, 5, 6].map(registro);
  assert.match(validarRegistro([persona(1)], EV, llenos, '2026-09-01 12:00'), /cupo se llenó/i);
});
test('rechaza correo ya registrado en el evento', () => {
  const err = validarRegistro([{ ...persona(1), correo: 'r1@mail.com' }], EV, [registro(1)], '2026-09-01 12:00');
  assert.match(err, /ya está registrado/);
});
test('registro válido devuelve null', () => {
  assert.equal(validarRegistro([persona(1), persona(2)], EV, [registro(1)], '2026-09-01 12:00'), null);
});
test('rechaza nombre y correo desmesurados', () => {
  assert.match(validarPersonas([{ nombre: 'x'.repeat(81), correo: 'a@b.co', telefono: '2221234567' }]), /demasiado largo/);
  assert.match(validarPersonas([{ nombre: 'Ana', correo: 'a'.repeat(250) + '@b.co', telefono: '2221234567' }]), /demasiado largo/);
});
