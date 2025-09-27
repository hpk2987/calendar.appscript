
import { JSONDB } from '../db/json.db';
import { EventoInterpretado, Monto } from '../calendario/interprete.eventos';
import { gestorArchivosLocal } from '../archivos/gestor.archivos';
import { getMonthStartEndPairs } from './date.utils';
import { printAsLocalNumber } from './string.utils';
import { inspect } from 'util';
import { calculateMean, calculateStandardDeviation } from './stats.utils';

export function completarMontosVacios(
    archivoDB: string,
    salida: string) {
    const db = new JSONDB<EventoInterpretado>(gestorArchivosLocal);
    db.cargar(archivoDB);
    const mapaServicioMonto: Record<string, Monto> = {};
    for (const evento of db) {
        if (!evento.error) {
            if (mapaServicioMonto[evento.servicio] &&
                (evento.monto.efectivo === 0 && evento.monto.transferencia === 0)) {
                evento.monto.efectivo = mapaServicioMonto[evento.servicio].efectivo;
                evento.monto.transferencia = mapaServicioMonto[evento.servicio].transferencia;
                console.log(`=> Evento con monto vacio:
                    Fecha: ${evento.crudo.fecha}
                    Descripcion: ${evento.crudo.descripcion})
                    Nuevo Monto: ${JSON.stringify(evento.monto)}`)
            }
            else if (!mapaServicioMonto[evento.servicio]) {
                mapaServicioMonto[evento.servicio] = evento.monto;
            } else if (
                mapaServicioMonto[evento.servicio].efectivo < evento.monto.efectivo ||
                mapaServicioMonto[evento.servicio].transferencia < evento.monto.transferencia
            ) {
                mapaServicioMonto[evento.servicio].efectivo =
                    Math.max(evento.monto.efectivo, mapaServicioMonto[evento.servicio].efectivo)
                mapaServicioMonto[evento.servicio].transferencia =
                    Math.max(evento.monto.transferencia, mapaServicioMonto[evento.servicio].transferencia)
            }
        }

    }
    db.guardar(salida);
}

export interface CalculoMensual {
    total: number,
    cantidadEventos: number
}

export function calcularGananciaEstimada(
    db: JSONDB<EventoInterpretado>,
    factor: number,
    inicio: Date,
    fin: Date): CalculoMensual {

    const eventos = db
        .buscar(e => {
            const f = new Date(e.crudo.fecha);
            return f >= inicio && f <= fin && !e.error;
        });
    return {
        cantidadEventos: eventos.length,
        total: eventos
            .map(x => x.monto.efectivo * factor)
            .reduce((acum, v) => acum + v, 0)
    }
}

export interface ReporteAgregado {
    mensuales: Array<{
        mes: number,
        cantidadEventos: number,
        total: string
    }>;
    total: {
        numero: string,
        promedioMensual: string,
        desvio: string,
        cantidadEventos: number
    },
    errores: Array<EventoInterpretado>
}

export function generarReporteAgregado(
    db: JSONDB<EventoInterpretado>,
    factor: number): ReporteAgregado {
    const pairs = getMonthStartEndPairs();
    const mensuales = pairs
        .map(x => ({
            calculo: calcularGananciaEstimada(
                db, factor, x.start, x.end),
            mes: x.start.getMonth() + 1
        }));

    const total = mensuales
        .map(x => x.calculo)
        .reduce((acum, v) => ({
            numero: acum.numero + v.total,
            cantidadEventos: acum.cantidadEventos + v.cantidadEventos
        }), {
            numero: 0,
            cantidadEventos: 0
        });
    return {
        errores: db.buscar(x => {
            const f = new Date(x.crudo.fecha);
            return f >= pairs[0].start && f <= pairs[pairs.length - 1].end && x.error;
        }),
        mensuales: mensuales.map(x => ({
            cantidadEventos: x.calculo.cantidadEventos,
            total: printAsLocalNumber(x.calculo.total),
            mes: x.mes
        })),
        total: {
            numero: printAsLocalNumber(total.numero),
            promedioMensual: printAsLocalNumber(
                calculateMean(mensuales
                    .map(x => x.calculo.total))),
            desvio: printAsLocalNumber(
                calculateStandardDeviation(
                    mensuales
                        .map(x => x.calculo.total))),
            cantidadEventos: total.cantidadEventos
        }
    };
}