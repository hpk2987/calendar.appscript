import { GestorArchivos } from "../archivos/gestor.archivos";

export class JSONDB<T> {
    private registros: T[] | undefined;
    private gestorArchivos: GestorArchivos;

    constructor(gestorArchivos: GestorArchivos) {
        this.gestorArchivos = gestorArchivos;
    }

    private getRegistros(): T[] {
        if (typeof this.registros === "undefined") {
            throw new Error("No hay datos cargados");
        }
        return this.registros;
    }

    crear(){
        this.registros = [];
    }

    cargar(archivo: string): void {
        const contenido = this.gestorArchivos.cargar(archivo);
        if (!contenido) {
            this.registros = [];
        } else {
            try {
                const data = JSON.parse(contenido);
                if (!Array.isArray(data)) {
                    throw new Error("La base de datos no contiene un arrray");
                }
                this.registros = data as T[];
            } catch (error) {
                throw error;
            }
        }
    }

    guardar(archivo: string): void {
        this.gestorArchivos.guardar(archivo, JSON.stringify(this.getRegistros()));
    }

    buscar(predicate: (record: T) => boolean): T[] {
        return this.getRegistros().filter(predicate);
    }

    buscarPrimero(predicate: (record: T) => boolean): T | undefined {
        return this.getRegistros().find(predicate);
    }

    agregarRegistro(registro: T): void {
        this.getRegistros().push(registro);
    }

    [Symbol.iterator](): Iterator<T> {
        return this.getRegistros()[Symbol.iterator]();
    }
}