import * as util from 'node:util';

import { interpretar } from "../src/interprete.eventos";
import { importarICS } from "./util/ics.utils";

describe('InterpreteEventos', () => {
  test('deberia interpretar el evento', (done) => {
    importarICS("./data/data.ics")
      .then(eventos => {
        const resultados = eventos
          .filter(e => e.fecha.getFullYear() >= 2025)
          .map(e => ({
            interpretado: interpretar(e.descripcion),
            calendario: e
          }));


        const ok = resultados.filter(x => !x.interpretado.error).length;
        const nok = resultados.filter(x => x.interpretado.error).length;
        /*if (nok !== 0) {
          console.log(util.inspect(resultados.filter(x => x.interpretado.error), { depth: 4, maxArrayLength: null }))
        } else {*/
          console.log(util.inspect(resultados.filter(x => !x.interpretado.error), { depth: 4, maxArrayLength: null }))
        //}
        console.log(`Cantidades:\t\tOK\t\tNOK\t\tTOTAL\n           \t\t${ok}\t\t${nok}\t\t${ok + nok}`)
        done();
      })
  });
});