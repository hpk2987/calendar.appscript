
export type Monto = {
    efectivo: number,
    transferencia: number
}

export interface Evento {
    crudo: string;
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

//"(?: (\$?(\d+(?:[.,]\d+)?)(?:\/(\d+(?:[.,]\d+)?))?))?"
const patronNum = "\d+(?:[.]\d+)?"
const grupoMonto = `(\\$?${patronNum}(?:\\/${patronNum}))`;

const regexConServicio = new RegExp(
    `^(.*?) (${modificadorServicio} )?(${servicios.join("|")})(:? ${grupoMonto})?`, "i");
const regexSinServicio = new RegExp(
    `^(.*?) ${grupoMonto}`, "i");

let calcularMontoParaServicioSinMonto: (servicio: string) => Monto = (s) => {
    switch (s) {
        default:
            return {
                efectivo: 1,
                transferencia: 1
            };
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

const calcularMontoDesdeEvento = (match: string): Monto => {
    return {
        efectivo: parseFloat(match.split("/")[0].replace("$", "").replace(".", "")),
        transferencia: parseFloat(match.split("/")[1].replace(".", ""))
    }
}

export const cambiarCalculoMontoParaServicioSinMonto = (funcion: (servicio: string) => Monto) => {
    calcularMontoParaServicioSinMonto = funcion;
}

export const interpretar = (evento: string): Evento => {
    let regex = regexConServicio;
    let match = evento.match(regex);

    if (!match) {
        regex = regexSinServicio
        match = evento.match(regex);

        if (!match) {
            return {
                debug: {
                    regex: regex,
                    match: match
                },
                crudo: "Error => " + evento,
                descripcion: "",
                servicio: "",
                monto: montoVacio,
                error: true
            }
        }
    }

    return {
        crudo: evento,
        descripcion: match[1],
        servicio: `${match[2] || ""}${match[3]}`,
        monto: aplicarModificadorMonto(
            match[4]
                ? calcularMontoDesdeEvento(match[4])
                : calcularMontoParaServicioSinMonto(match[3]),
            !!match[2]),
        error: false,
        debug: {
            regex: regex,
            match: match
        }
    }
}