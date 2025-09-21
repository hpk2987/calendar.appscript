import { crearGestorCalendarioLocal } from "../../src/calendario/gestor.calendario";
import * as ical from "node-ical";

// Mock node-ical
jest.mock("node-ical");

describe("crearGestorCalendarioLocal", () => {
    const mockEventos = [
        {
            type: "VEVENT",
            summary: "Evento 1",
            start: new Date("2025-09-20T10:00:00Z")
        },
        {
            type: "VEVENT",
            summary: "Evento 2",
            start: new Date("2025-09-21T12:00:00Z")
        },
        {
            type: "VTODO", // Should be ignored
            summary: "No evento",
            start: new Date("2025-09-22T12:00:00Z")
        }
    ];

    beforeEach(() => {
        (ical.parseFile as jest.Mock).mockResolvedValue({
            a: mockEventos[0],
            b: mockEventos[1],
            c: mockEventos[2]
        });
    });

    it("should parse VEVENTs and return them in buscar", async () => {
        const gestor = await crearGestorCalendarioLocal("archivo.ics");
        const inicio = new Date("2025-09-20T00:00:00Z");
        const fin = new Date("2025-09-21T23:59:59Z");
        const eventos = gestor.buscar(inicio, fin);

        expect(eventos).toEqual([
            {
                descripcion: "Evento 1",
                fecha: new Date("2025-09-20T10:00:00Z")
            },
            {
                descripcion: "Evento 2",
                fecha: new Date("2025-09-21T12:00:00Z")
            }
        ]);
    });

    it("should filter events by date range", async () => {
        const gestor = await crearGestorCalendarioLocal("archivo.ics");
        const inicio = new Date("2025-09-21T00:00:00Z");
        const fin = new Date("2025-09-21T23:59:59Z");
        const eventos = gestor.buscar(inicio, fin);

        expect(eventos).toEqual([
            {
                descripcion: "Evento 2",
                fecha: new Date("2025-09-21T12:00:00Z")
            }
        ]);
    });

    it("should return empty array if no events in range", async () => {
        const gestor = await crearGestorCalendarioLocal("archivo.ics");
        const inicio = new Date("2025-09-23T00:00:00Z");
        const fin = new Date("2025-09-23T23:59:59Z");
        const eventos = gestor.buscar(inicio, fin);

        expect(eventos).toEqual([]);
    });
});