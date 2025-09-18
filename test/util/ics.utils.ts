import * as ical from 'node-ical';

export type Evento = {
  descripcion: string;
  fecha: Date;
}

export async function importarICS(archivo: string) {
  return Object.values(await ical.parseFile(archivo))
    .filter(x => x.type == "VEVENT")
    .map(x => ({
      descripcion: x.summary,
      fecha: x.start
    }))
}