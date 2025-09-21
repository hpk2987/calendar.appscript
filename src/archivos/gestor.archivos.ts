import * as fs from "fs";


export interface GestorArchivos {
    cargar(ruta: string): string | undefined;
    guardar(ruta: string, data: any): void;
}

export const gestorArchivosLocal = {
    cargar(ruta: string): string | undefined {
        if (!fs.existsSync(ruta)) {
            return undefined;
        }
        return fs.readFileSync(ruta, 'utf8');
    },
    guardar(ruta: string, data: any): void {
        fs.writeFileSync(
            ruta,
            typeof data === 'string' ? data : JSON.stringify(data),
            'utf8'
        );
    }
}