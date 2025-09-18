// Import the function you want to test
import {interpretar } from '../src/interprete.eventos';

describe('InterpreteEventos', () => {
  test('deberia interpretar el evento', () => {
    expect(interpretar("Nombre ficticio 55 $22.000/44.000"))
      .toStrictEqual({
        descripcion: 'Nombre ficticio',
        servicio: "55",
        monto: {
          efectivo: 22000,
          transferencia: 44000
        }
      });
  });

  test('deberia dividir el monto a la mitad', () => {
    expect(interpretar("Nombre ficticio pareja 55 $22.000/44.000"))
      .toStrictEqual({
        descripcion: 'Nombre ficticio',
        servicio: "pareja 55",
        monto: {
          efectivo: 11000,
          transferencia: 22000
        }
      });
  });

  test('deberia obtener el valor de la funcion calcularMontoParaServicioPago cuando dice pago', () => {
    expect(interpretar("Nombre ficticio 55 pago"))
      .toStrictEqual({
        descripcion: 'Nombre ficticio',
        servicio: "55",
        monto: {
          efectivo: 1,
          transferencia: 1
        }
      });
  });
});