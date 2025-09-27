import { JSONDB } from './db/json.db';
import { EventoInterpretado, Monto } from './calendario/interprete.eventos';
import { gestorArchivosLocal } from './archivos/gestor.archivos';
import { inspect } from 'util';
import { calcularGananciaEstimada, generarReporteAgregado } from './utils/montos';
import { printAsLocalNumber } from './utils/string.utils';

const jsonDB = new JSONDB<EventoInterpretado>(gestorArchivosLocal);
jsonDB.cargar("./data/corregido.json");

const factor = 0.35;
const inicio = new Date(new Date().getFullYear(), 0, 1); // Jan 1, 00:00:00
const fin = new Date(); // Now
const calculoTotal = calcularGananciaEstimada(
    jsonDB,
    factor,
    inicio,
    fin
);

console.log("Anual => " + inspect({
    total : printAsLocalNumber(calculoTotal.total),
    cantidadEventos: calculoTotal.cantidadEventos
}));

console.log("Mensual => " + inspect(generarReporteAgregado(
    jsonDB,
    factor
)));