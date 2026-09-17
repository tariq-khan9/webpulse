export interface DailyUptime {
  // UTC day as YYYY-MM-DD.
  date: string;
  uptimePercentage: number;
}

// Mean of the daily rollup rows within the last `days` UTC days. Days before
// the monitor existed have no row, so they are simply not counted. Returns
// null until the first nightly rollup has run.
export function averageUptime(rows: DailyUptime[], days: number): number | null {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const inWindow = rows.filter((row) => row.date >= cutoff);

  if (inWindow.length === 0) return null;

  const total = inWindow.reduce((sum, row) => sum + row.uptimePercentage, 0);
  return Math.round((total / inWindow.length) * 100) / 100;
}
