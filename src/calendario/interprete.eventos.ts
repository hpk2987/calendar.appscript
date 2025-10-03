import { EventoCalendario } from "./gestor.calendario";

const modoDebug = process.env.MODO === "DEBUG"

export type Monto = {
    efectivo: number,
    transferencia: number,
    modificador: number
}

export interface EventoInterpretado {
    crudo: EventoCalendario;
    descripcion: string;
    servicio: string;
    monto: Monto;
    error: boolean;
    debug?: {
        regex: RegExp,
        match: RegExpMatchArray | null
    }
}

const montoVacio = (modificador: number) => ({
    efectivo: 0,
    transferencia: 0,
    modificador: modificador
})


const modificadorServicio = "pareja";
const servicios = [
    "x4 manos", "4 manos",
    "RELAJANTE",
    "spa",
    "55", "75", "40", "60", "80", "35", "34"];
const serviciosQueModificanMonto = [
    servicios[0], servicios[1]
]

const montoRegex = /(\$?\d+(?:[.]\d+)?(?:\/\$?\d+(?:[.]\d+)?)?)/g;

// Primer intento de regexp, confiable solo falla cuando no hay servicio
const regex = new RegExp(
    `^(.*?) (?:(${modificadorServicio} )?(${servicios.join("|")}))(.*)`, "i");

const calcularMontoDesdeEvento = (segmentoMonto: string, modificador: number): Monto => {
    if (segmentoMonto.includes("pago")) {
        return montoVacio(modificador);
    }

    const match = segmentoMonto.match(montoRegex);

    if (!match) {
        return montoVacio(modificador);
    }

    if(match.length>2){
        return montoVacio(0);
    }

    const dinero = match.length == 2 ? match[1] : match[0];
    // Si hay pack reducir el modificador
    modificador = match.length == 2 ? ((modificador-0.05)*modificador) : modificador;

    if (dinero.match(/[^\d]+\d\/\d[^\d]+/)) {
        return montoVacio(0);
    }

    if (dinero.includes("/")) {
        return {
            efectivo: parseFloat(dinero.split("/")[0]
                .replace("$", "").replace(".", "")),
            transferencia: parseFloat(dinero.split("/")[1]
                .replace("$", "").replace(".", "")),
            modificador
        }
    } else {
        return {
            efectivo: parseFloat((dinero).replace("$", "")
                .replace(".", "")),
            transferencia: 0,
            modificador
        }
    }
}

export const interpretar = (evento: EventoCalendario): EventoInterpretado => {
    let match = evento.descripcion.match(regex);

    if (!match) {
        return {
            ...(modoDebug
                ? {
                    debug: {
                        regex: regex,
                        match: match
                    }
                }
                : {}),
            crudo: evento,
            descripcion: "",
            servicio: "",
            monto: montoVacio(0),
            error: true
        }
    }

    const descripcion = match[1];
    const servicio = `${match[2] || ""}${match[3] || ""}`;
    const modificador = (serviciosQueModificanMonto
        .includes(match[3]) || !!match[2])
        ? 0.5 : 1;

    return {
        crudo: evento,
        descripcion,
        servicio,
        monto: match[4]
            ? calcularMontoDesdeEvento(match[4], modificador)
            : (montoVacio)(modificador),
        error: false,
        ...(modoDebug
            ? {
                debug: {
                    regex: regex,
                    match: match
                }
            }
            : {})
    }
}