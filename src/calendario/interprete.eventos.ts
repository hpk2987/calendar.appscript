import { JSONDB } from "../db/json.db";
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
    "4\\/4",
    "RELAJANTE",
    "spa",
    "55", "75", "40", "60", "80", "35", "34"];
const serviciosQueModificanMonto = [
    servicios[0], servicios[1]
]

const montoRegex = /(\$?\d+(?:[.]\d+)?(?:\/\$?\d+(?:[.]\d+)?)?)/;

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

    if (match[1].includes("/")) {
        return {
            efectivo: parseFloat(match[1].split("/")[0]
                .replace("$", "").replace(".", "")),
            transferencia: parseFloat(match[1].split("/")[1]
                .replace("$", "").replace(".", "")),
            modificador
        }
    } else {
        return {
            efectivo: parseFloat((match[1]).replace("$", "")
                .replace(".", "")),
            transferencia: 0,
            modificador
        }
    }
}

export type CalculadoraMontoParaServicio = (servicio: string, modificador: number) => Monto;

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
    const servicio = `${match[2] || ""}${match[3]}`;
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