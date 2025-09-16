
export type Monto = {
    efectivo: number,
    transferencia: number
}

export interface Evento {
    crudo: string;
    descripcion: string;
    servicio: string;
    monto: Monto
}

const montoVacio = {
    efectivo: 0,
    transferencia: 0
}


const modificadorServicio = "pareja";
const servicios = ["x4 manos", "RELAJANTE", "55", "75", "spa"];
const grupoMonto = "(\\$?[0-9]*\\.?[0-9]*\\/[0-9]*\\.?[0-9]*)";
const regex = new RegExp(
    `^(.*) (${modificadorServicio})?(${servicios.join("|")}) ${grupoMonto}?`,"i");

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
        efectivo :parseFloat(match.split("/")[0].replace("$","").replace(".","")),
        transferencia: parseFloat(match.split("/")[0].replace("$","").replace(".",""))
    }
}

export const cambiarCalculoMontoParaServicioSinMonto = (funcion: (servicio: string) => Monto) => {
    calcularMontoParaServicioSinMonto = funcion;
}

export const interpretar = (evento: string): Evento => {
    const match = evento.match(regex);

    if (!match) {
        return {
            crudo: "Error => " + evento,
            descripcion: "",
            servicio: "",
            monto: montoVacio
        }
    }

    return {
        crudo: evento,
        descripcion: match[1],
        servicio: match[2] === modificadorServicio ? match[2] + " " + match[3] : match[2],
        monto: aplicarModificadorMonto(
            (match.length === ((match[2] === modificadorServicio ? 1 : 0) + 4))
                ? calcularMontoDesdeEvento(match[4])
                : calcularMontoParaServicioSinMonto(match[3]),
            match[2] === modificadorServicio)
    }
}