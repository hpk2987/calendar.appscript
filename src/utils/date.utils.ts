export interface MonthDatePair {
    start: Date;
    end: Date;
}

export function getMonthStartEndPairs(): MonthDatePair[] {
    const pairs: MonthDatePair[] = [];
    const today: Date = new Date();
    const currentYear: number = today.getFullYear();
    const currentMonth: number = today.getMonth();
    const todayEnd: Date = new Date(currentYear, currentMonth, today.getDate());

    for (let month: number = 0; month <= currentMonth; month++) {
        const startDate: Date = new Date(currentYear, month, 1);
        let endDate: Date = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

        if (month === currentMonth) {
            endDate = todayEnd;
        }

        pairs.push({ start: startDate, end: endDate });
    }

    return pairs;
}
