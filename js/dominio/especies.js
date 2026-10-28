// Configuración de las especies que recibe la guardería.
// Es DATO, no lógica: las reglas y la calculadora la reciben por el constructor (inversión de dependencias).
// Agregar una especie nueva es agregar una entrada aquí, sin tocar ninguna regla (abierto/cerrado).
(function (exportar) {
  'use strict';

  const ESPECIES = {
    Perro:  { tarifaBase: 30000, pesoMaximo: 80, requiereAntirrabica: true },
    Gato:   { tarifaBase: 25000, pesoMaximo: 15, requiereAntirrabica: true },
    Ave:    { tarifaBase: 15000, pesoMaximo: 2,  requiereAntirrabica: false },
    Conejo: { tarifaBase: 20000, pesoMaximo: 8, requiereAntirrabica: false },
  };

  exportar('ESPECIES', ESPECIES);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
