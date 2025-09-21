import * as ical from 'node-ical';

export interface EventoCalendario {
    descripcion: string;
    fecha: Date;
}

export interface GestorCalendario {
    buscar(inicio: Date, fin: Date): Array<EventoCalendario>;
}

export const crearGestorCalendarioLocal
    : (archivoICS: string) => Promise<GestorCalendario>
    = async (archivo: string) => {
        const eventos =  Object.values(await ical.parseFile(archivo))
            .filter(x => x.type == "VEVENT")
            .map(x => ({
                descripcion: x.summary,
                fecha: x.start
            }))

        return {
            buscar(inicio: Date, fin: Date): Array<EventoCalendario> {
                return eventos.filter(evento =>
                    evento.fecha >= inicio && evento.fecha <= fin
                );
            }
        }
    }