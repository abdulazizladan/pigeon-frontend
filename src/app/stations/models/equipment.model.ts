/** Fuel products every station sells. Each pump sells one; each station has one reservoir per product. */
export type Product = 'petrol' | 'diesel' | 'kerosene';

export const PRODUCTS: Product[] = ['petrol', 'diesel', 'kerosene'];

export const PRODUCT_LABELS: Record<Product, string> = {
  petrol: 'Petrol (PMS)',
  diesel: 'Diesel (AGO)',
  kerosene: 'Kerosene (DPK)',
};

export function productLabel(product: Product): string {
  return PRODUCT_LABELS[product] ?? product;
}

export interface ProductPrice {
  product: Product;
  /** ₦ per litre, or null when no price has been set yet. */
  pricePerLitre: number | null;
  updatedAt: string | null;
}

export type PumpStatus = 'active' | 'inactive';

export interface Pump {
  id: string;
  stationId: string;
  name: string;
  product: Product;
  status: PumpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Reservoir {
  id: string;
  stationId: string;
  product: Product;
  capacityLitres: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePumpPayload {
  name: string;
  product: Product;
  status?: PumpStatus;
}

export interface UpdatePumpPayload {
  name?: string;
  product?: Product;
  status?: PumpStatus;
}

export interface CreateReservoirPayload {
  product: Product;
  capacityLitres: number;
}

export interface UpdateReservoirPayload {
  capacityLitres?: number;
}

// ---- Reservoir levels ----
export type LevelStatus = 'ok' | 'low' | 'critical' | 'unknown';

export interface ReservoirLevelIndicator {
  reservoirId: string;
  product: Product;
  capacityLitres: number;
  level: number | null;
  percent: number | null;
  recordedOn: string | null;
  source: 'level' | 'daily_record' | null;
  recordedByUsername: string | null;
  /** Average litres of this product sold per day over the last 14 recorded days. */
  avgDailyLitres: number;
  daysRemaining: number | null;
  status: LevelStatus;
}

export interface StationLevels {
  station: { id: string; name: string; code: string };
  asOf: string;
  reservoirs: ReservoirLevelIndicator[];
}

export interface StationLevelsSummary {
  stationId: string;
  reservoirs: ReservoirLevelIndicator[];
}

export type LevelBand = 'green' | 'amber' | 'red' | 'none';

/** At-a-glance colour for a list: above 75% green, 25% to 74% amber, below 25% red. */
export function levelBand(percent: number | null): LevelBand {
  if (percent === null) return 'none';
  if (percent > 75) return 'green';
  if (percent >= 25) return 'amber';
  return 'red';
}

export function levelBandLabel(band: LevelBand): string {
  return { green: 'Well stocked', amber: 'Moderate', red: 'Low', none: 'No reading' }[band];
}

export interface RecordLevelsPayload {
  stationId?: string;
  recordedOn?: string;
  levels: { reservoirId: string; level: number }[];
}

export function levelStatusLabel(s: LevelStatus): string {
  return { ok: 'Stocked', low: 'Running low', critical: 'Critical', unknown: 'No reading yet' }[s];
}
