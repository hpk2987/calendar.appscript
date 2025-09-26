
import { JSONDB } from './db/json.db';
import { EventoInterpretado, Monto } from './calendario/interprete.eventos';
import { gestorArchivosLocal } from './archivos/gestor.archivos';

export function completarMontosVacios(archivoDB: string, salida: string) {
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

completarMontosVacios("./data/db.json", "./data/corregido.json");