import { JSONDB } from "../db/json.db";
import { EventoCalendario } from "./gestor.calendario";

const modoDebug = process.env.MODO === "DEBUG"

export type Monto = {
    efectivo: number,
    transferencia: number
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

const montoVacio = {
    efectivo: 0,
    transferencia: 0
}


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

export const calculadoraMontoParaServicioSinMontoDefault
    : CalculadoraMontoParaServicio = (s) => {
        switch (s) {
            default:
                return {
                    efectivo: 0,
                    transferencia: 0
                };
        }
    }

export const crearCalculadoraMontoParaServiciosSinMontoJsonDB
    : (f: JSONDB<EventoInterpretado>) => CalculadoraMontoParaServicio = (f) => {
        return (s) => {
            const resultado = f
                .buscarPrimero(e => e.servicio === s);

            return resultado
                ? resultado.monto
                : calculadoraMontoParaServicioSinMontoDefault(s);
        }
    };

const calcularMontoDesdeEvento = (segmentoMonto: string): Monto => {
    if (segmentoMonto.includes("pago")) {
        return montoVacio;
    }

    const match = segmentoMonto.match(montoRegex);

    if (!match) {
        return montoVacio;
    }

    if (match[1].includes("/")) {
        return {
            efectivo: parseFloat(match[1].split("/")[0]
                .replace("$", "").replace(".", "")),
            transferencia: parseFloat(match[1].split("/")[1]
                .replace("$", "").replace(".", ""))
        }
    } else {
        return {
            efectivo: parseFloat((match[1]).replace("$", "")
                .replace(".", "")),
            transferencia: 0
        }
    }
}

export type CalculadoraMontoParaServicio = (servicio: string) => Monto;

export const interpretar = (
    evento: EventoCalendario,
    calculadoraMontos?: CalculadoraMontoParaServicio): EventoInterpretado => {
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
            monto: montoVacio,
            error: true
        }
    }

    return {
        crudo: evento,
        descripcion: match[1],
        servicio: `${match[2] || ""}${match[3]}`,
        monto: aplicarModificadorMonto(
            match[4]
                ? calcularMontoDesdeEvento(match[4])
                : (calculadoraMontos ||
                    calculadoraMontoParaServicioSinMontoDefault)(match[3]),
            serviciosQueModificanMonto.includes(match[4])
            || !!match[2]),
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

const aplicarModificadorMonto = (monto: Monto, modificador: boolean) => {
    if (modificador) {
        return {
            efectivo: monto.efectivo / 2,
            transferencia: monto.transferencia / 2
        }
    } else {
        return monto;
    }
}