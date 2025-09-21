import { gestorArchivosLocal } from './archivos/gestor.archivos';
import { crearGestorCalendarioLocal } from './calendario/gestor.calendario';
import { EventoInterpretado, interpretar } from "./calendario/interprete.eventos";
import { JSONDB } from './db/json.db';

const jsonDB = new JSONDB<EventoInterpretado>(gestorArchivosLocal);
jsonDB.cargar("./data/db.json");

const currentYear = new Date().getFullYear();
const minTime = new Date(`${currentYear}-01-01T00:00:00Z`);
const maxTime = new Date(`${currentYear}-12-31T23:59:59Z`);

crearGestorCalendarioLocal("./data/data.ics")
  .then(async g => {
    await g.buscar(minTime, maxTime )
    .map(e => interpretar(e))
    .forEach(e => jsonDB.agregarRegistro(e));
  });