import { gestorArchivosLocal } from './archivos/gestor.archivos';
import { crearGestorCalendarioLocal } from './calendario/gestor.calendario';
import { EventoInterpretado, interpretar } from "./calendario/interprete.eventos";
import { JSONDB } from './db/json.db';

const jsonDB = new JSONDB<EventoInterpretado>(gestorArchivosLocal);
const dbFile = "./data/db.json";
jsonDB.crear();

const currentYear = new Date().getFullYear();
const minTime = new Date(`${currentYear}-01-01T00:00:00Z`);
const maxTime = new Date(`${currentYear}-12-31T23:59:59Z`);

crearGestorCalendarioLocal("./data/data.ics")
  .then(g => {
    console.log("Gestor calendario local creado buscando eventos");
    return g.buscar(minTime, maxTime);
  })
  .then(eventos => {
    console.log("Eventos encontrados: " + eventos.length);
    const m : Array<EventoInterpretado> = [];
    eventos
      .map(e => interpretar(e))
      .forEach(e => {
        console.log("Agregando => " + JSON.stringify(e));
        m.push(e);
        jsonDB.agregarRegistro(e)
      });
    jsonDB.guardar(dbFile);
    console.log("Fin");
  });