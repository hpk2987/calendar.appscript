
export function printAsLocalNumber(x: number): string {
    return x.toLocaleString(
        'es-AR',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}