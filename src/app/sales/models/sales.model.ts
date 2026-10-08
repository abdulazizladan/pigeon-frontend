/** ISO 4217 code used for every sales figure in the UI. Change here to switch currency. */
export const CURRENCY_CODE = 'NGN';

export interface SalesPoint {
  date: string; // YYYY-MM-DD
  /** ₦ from pump meters that day. */
  amount: number;
  litres: number;
  /** Pump readings recorded that day. */
  transactions: number;
}

export interface SalesSummary {
  from: string;
  to: string;
  stationId: string | null;
  days: number;
  totalAmount: number;
  totalLitres: number;
  totalTransactions: number;
  averagePerDay: number;
  points: SalesPoint[];
}

export interface SalesQuery {
  from: string;
  to: string;
  stationId: string | null;
}

export type RangePreset = '7d' | '30d' | '90d' | 'mtd' | 'custom';

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'custom', label: 'Custom' },
];

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function rangeForPreset(
  preset: Exclude<RangePreset, 'custom'>,
  today: Date = new Date(),
): { from: string; to: string } {
  const start = new Date(today);
  switch (preset) {
    case '7d': start.setDate(start.getDate() - 6); break;
    case '30d': start.setDate(start.getDate() - 29); break;
    case '90d': start.setDate(start.getDate() - 89); break;
    case 'mtd': start.setDate(1); break;
  }
  return { from: formatLocalDate(start), to: formatLocalDate(today) };
}

const longDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

export function formatLongDate(isoDay: string): string {
  return longDate.format(new Date(`${isoDay}T00:00:00`));
}

export function formatShortDate(isoDay: string): string {
  return shortDate.format(new Date(`${isoDay}T00:00:00`));
}

const compactCurrency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY_CODE,
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullCurrency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

export function formatCompactCurrency(value: number): string {
  return compactCurrency.format(value);
}

export function formatCurrency(value: number): string {
  return fullCurrency.format(value);
}

const litresFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export function formatLitres(value: number): string {
  return `${litresFormat.format(value)} L`;
}
