import { JSONDB } from "../../src/db/json.db";
import { GestorArchivos } from "../../src/archivos/gestor.archivos";

type TestRecord = { id: number; name: string };

describe("JSONDB.cargar", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should not throw if file does not exist (registros becomes empty array)", () => {
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(undefined);
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.cargar("archivo.json")).not.toThrow();
    });

    it("should not throw if file contains valid array JSON", () => {
        const records: TestRecord[] = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.cargar("archivo.json")).not.toThrow();
    });

    it("should throw error if file contains non-array JSON", () => {
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify({ foo: "bar" }));
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.cargar("archivo.json")).toThrow("La base de datos no contiene un arrray");
    });

    it("should throw error if file contains invalid JSON", () => {
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue("invalid json");
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.cargar("archivo.json")).toThrow();
    });
});

describe("JSONDB.guardar", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should call gestorArchivos.guardar with the internal registros array after cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        db.guardar("archivo.json");

        expect(gestorArchivosMock.guardar).toHaveBeenCalledWith(
            "archivo.json",
            JSON.stringify(records)
        );
    });

    it("should call gestorArchivos.guardar with an empty array if cargar loaded nothing", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(undefined);
        db.cargar("archivo.json");

        db.guardar("archivo.json");

        expect(gestorArchivosMock.guardar).toHaveBeenCalledWith(
            "archivo.json",
            JSON.stringify([])
        );
    });

    it("should throw error if guardar is called before cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.guardar("archivo.json")).toThrow("No hay datos cargados");
    });
});

describe("JSONDB.ordenar",() =>{
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should sort records using predicate", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [
            { id: 1, name: "Janice" },
            { id: 2, name: "Bob" },
            { id: 3, name: "Anna" }
        ];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        db.ordenar((r1,r2) => r1.name.localeCompare(r2.name));
        const result = db.buscar(() => true);
        expect(result).toEqual([
            { id: 3, name: "Anna" },
            { id: 2, name: "Bob" },
            { id: 1, name: "Janice" }
        ]);
    });
});

describe("JSONDB.buscar", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should return matching records using predicate", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 3, name: "Alice" }
        ];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        const result = db.buscar(r => r.name === "Alice");
        expect(result).toEqual([
            { id: 1, name: "Alice" },
            { id: 3, name: "Alice" }
        ]);
    });

    it("should return empty array if no records match", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [{ id: 1, name: "Alice" }];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        const result = db.buscar(r => r.name === "Bob");
        expect(result).toEqual([]);
    });

    it("should throw error if buscar is called before cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.buscar(r => true)).toThrow("No hay datos cargados");
    });
});

describe("JSONDB.buscarPrimero", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should return the first matching record using predicate", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 3, name: "Alice" }
        ];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        const result = db.buscarPrimero(r => r.name === "Alice");
        expect(result).toEqual({ id: 1, name: "Alice" });
    });

    it("should return undefined if no records match", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [{ id: 1, name: "Alice" }];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        const result = db.buscarPrimero(r => r.name === "Bob");
        expect(result).toBeUndefined();
    });

    it("should throw error if buscarPrimero is called before cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.buscarPrimero(r => true)).toThrow("No hay datos cargados");
    });
});

describe("JSONDB.agregarRegistro", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should add a new record to registros", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify([]));
        db.cargar("archivo.json");

        db.agregarRegistro({ id: 1, name: "Alice" });
        db.agregarRegistro({ id: 2, name: "Bob" });

        const result = db.buscar(() => true);
        expect(result).toEqual([
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" }
        ]);
    });

    it("should throw error if agregarRegistro is called before cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => db.agregarRegistro({ id: 1, name: "Alice" })).toThrow("No hay datos cargados");
    });
});

describe("JSONDB iterable", () => {
    let gestorArchivosMock: GestorArchivos;

    beforeEach(() => {
        gestorArchivosMock = {
            cargar: jest.fn(),
            guardar: jest.fn()
        };
    });

    it("should allow iteration over registros using for...of", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        const records: TestRecord[] = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" }
        ];
        (gestorArchivosMock.cargar as jest.Mock).mockReturnValue(JSON.stringify(records));
        db.cargar("archivo.json");

        const result: TestRecord[] = [];
        for (const registro of db) {
            result.push(registro);
        }

        expect(result).toEqual(records);
    });

    it("should throw error if iterated before cargar", () => {
        const db = new JSONDB<TestRecord>(gestorArchivosMock);
        expect(() => {
            // Attempt to iterate before cargar
            // This will trigger getRegistros() and throw
            // Spread operator triggers iteration
            [...db];
        }).toThrow("No hay datos cargados");
    });
});