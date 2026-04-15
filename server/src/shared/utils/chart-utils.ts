export function build30DayChart(purchases: any[]) {
    const fmtDate = (d: Date): string => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isoDay = (d: Date | string): string => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);

    const now = new Date();
    const chartData: { date: string; purchases: number; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = isoDay(d);
        const dayP = purchases.filter((p: any) => isoDay(p.createdAt) === dayStr);
        chartData.push({
            date: fmtDate(d),
            purchases: dayP.length,
            revenue: dayP.reduce((s: number, p: any) => s + (p.amount || 0), 0),
        });
    }
    return chartData;
}
