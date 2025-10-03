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
          modificador: 1,
          transferencia: 44000
        }
      });
  });

  test('deberia interpretar el evento con pack', () => {
    expect(interpretar({
      descripcion: "Nombre ficticio 55 2/4 22.000/44.000",
      fecha: fechaTest
    }))
      .toStrictEqual({
        crudo: {
          descripcion: "Nombre ficticio 55 2/4 22.000/44.000",
          fecha: fechaTest,
        },
        descripcion: 'Nombre ficticio',
        servicio: "55",
        error: false,
        monto: {
          efectivo: 22000,
          modificador: 0.95,
          transferencia: 44000
        }
      });
  });

  test('deberia fallar sin servicio', () => {
    expect(interpretar({
      descripcion: "11:30(i) Pablo princz o mujer $24.000/28.200",
      fecha: fechaTest
    }))
      .toStrictEqual({
        crudo: {
          descripcion: "11:30(i) Pablo princz o mujer $24.000/28.200",
          fecha: fechaTest,
        },
        descripcion: "",
        servicio: "",
        error: true,
        monto: {
          efectivo: 0,
          modificador:0,
          transferencia: 0
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
          efectivo: 22000,
          modificador: 0.5,
          transferencia: 44000
        }
      });
  });
});