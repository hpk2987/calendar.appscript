// Import the function you want to test
import { interpretar } from '../../src/calendario/interprete.eventos';

describe('InterpreteEventos', () => {
  const fechaTest = new Date();

  test('deberia interpretar el evento', () => {
    expect(interpretar({
      descripcion: "Nombre ficticio 55 $22.000/44.000",
      fecha: fechaTest
    }))
      .toStrictEqual({
        crudo: {
          descripcion: "Nombre ficticio 55 $22.000/44.000",
          fecha: fechaTest,
        },
        descripcion: 'Nombre ficticio',
        servicio: "55",
        error: false,
        monto: {
          efectivo: 22000,
          transferencia: 44000
        }
      });
  });

  test('deberia dividir el monto a la mitad', () => {
    expect(interpretar({
      descripcion: "Nombre ficticio pareja 55 $22.000/44.000",
      fecha: fechaTest
    }))
      .toStrictEqual({
        crudo: {
          descripcion: "Nombre ficticio pareja 55 $22.000/44.000",
          fecha: fechaTest,
        },
        descripcion: 'Nombre ficticio',
        servicio: "pareja 55",
        error: false,
        monto: {
          efectivo: 11000,
          transferencia: 22000
        }
      });
  });

  test('deberia obtener el valor de la funcion calcularMontoParaServicioPago cuando dice pago', () => {
    expect(interpretar({
      descripcion: "Nombre ficticio 55 pago",
      fecha: fechaTest
    }))
      .toStrictEqual({
        crudo: {
          descripcion: "Nombre ficticio 55 pago",
          fecha: fechaTest,
        },
        descripcion: 'Nombre ficticio',
        servicio: "55",
        error: false,
        monto: {
          efectivo: 0,
          transferencia: 0
        }
      });
  });
});