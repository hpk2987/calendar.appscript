
export type Monto = {
    efectivo: number,
    transferencia: number
}

export interface ParsedEvent {
    descripcion: string;
    servicio: string;
    monto: Monto
}

const montoVacio = {
    efectivo: 0,
    transferencia: 0
}

const demarcadores = {
    separacion: ["pareja", "55", "75"],
    pagoDividido: "pareja",
    yaPagado: "pago",
    pago: [/^\$/, /^pago$/]
}

let calcularMontoParaServicioPago: (servicio: string) => Monto = (s) => {
    switch (s) {
        case "55":
            return {
                efectivo: 1,
                transferencia: 1
            };
        case "75":
            return {
                efectivo: 1,
                transferencia: 1
            };
        default:
            return {
                efectivo: 1,
                transferencia: 1
            };
    }
}

export class InterpreteEventos {

    static cambiarCalculoParaServicioPago(funcion: (servicio: string) => Monto) {
        calcularMontoParaServicioPago = funcion;
    }

    static interpretarEvento(event: string): ParsedEvent {
        const partes = event.split(" ");
        const separacion = partes.find(x => demarcadores.separacion.includes(x));

        if (!separacion) {
            return {
                descripcion: "No se pudo interpretar => " + event,
                servicio: "",
                monto: montoVacio,
            }
        }

        const indexSeparacion = partes.indexOf(separacion);
        return {
            descripcion: partes.slice(0, indexSeparacion).join(" "),
            ...InterpreteEventos.calcularMontoYServicio(partes.slice(indexSeparacion, partes.length))
        };
    }

    static calcularMontoYServicio(partes: string[]): {
        monto: Monto,
        servicio: string
    } {
        if (partes.length === 0) {
            return {
                monto: montoVacio,
                servicio: "Error => " + partes.join(" ")
            };
        }

        const separacion = partes.find(x => demarcadores.pago.some(y => x.match(y)));
        if (!separacion) {
            return {
                monto: montoVacio,
                servicio: "Error => " + partes.join(" ")
            };
        }

        const indexSeparacion = partes.indexOf(separacion);
        const servicio = partes.slice(0, indexSeparacion).join(" ");
        const monto = InterpreteEventos.calcularMonto(
            servicio,
            partes.slice(indexSeparacion, partes.length));

        return monto !== montoVacio
            ? {
                servicio,
                monto: monto
            }
            : {
                servicio: "Error => " + partes.join(" "),
                monto: montoVacio
            };
    }

    static calcularMonto(servicio: string, partes: string[]): Monto {
        if (partes.length === 0) {
            return montoVacio;
        }

        const pagoDividido = servicio.startsWith(demarcadores.pagoDividido);
        let monto;
        if (partes[0] === demarcadores.yaPagado) {
            monto = calcularMontoParaServicioPago(pagoDividido
                ? servicio.replace(demarcadores.pagoDividido + " ", "")
                : servicio)
        } else {
            const regex: RegExp = /\$(\d+\.\d+)\/(\d+\.\d+)/;
            const match = partes.join(" ").match(regex);

            if (match) {
                monto = {
                    efectivo: parseFloat(match[1].replaceAll(".", "")),
                    transferencia: parseFloat(match[2].replaceAll(".", "")),
                }
                if (Number.isNaN(monto.efectivo) || Number.isNaN(monto.transferencia)) {
                    return montoVacio;
                }
            } else {
                return montoVacio;
            }
        }

        return pagoDividido
            ? {
                efectivo: monto.efectivo / 2,
                transferencia: monto.transferencia / 2
            }
            : monto;
    }
}