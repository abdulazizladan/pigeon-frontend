import { Product } from '../../stations/models/equipment.model';

export interface PumpLine {
  pumpId: string;
  pumpName: string;
  product: Product;
  openingReading: number;
  closingReading: number;
  pricePerLitre: number;
  /** Metered: closing − opening. */
  actualLitres: number;
  actualAmount: number;
  /** This pump's equal share of the reservoir drop; null when the reservoir was not read. */
  expectedLitres: number | null;
  expectedAmount: number | null;
  varianceLitres: number | null;
  varianceAmount: number | null;
}

export interface ReservoirLine {
  reservoirId: string;
  openingLevel: number;
  deliveredLitres: number;
  closingLevel: number;
  expectedLitres: number;
}

export interface Totals {
  expectedLitres: number;
  actualLitres: number;
  varianceLitres: number;
  expectedAmount: number;
  actualAmount: number;
  varianceAmount: number;
}

export interface ProductLine extends Totals {
  product: Product;
  pricePerLitre: number | null;
  reservoir: ReservoirLine | null;
  pumps: PumpLine[];
}

/** One trading day at one station, reconciled: pump meters (actual) against reservoir dips (expected). */
export interface DailySalesReport {
  id: string;
  stationId: string;
  recordedOn: string;
  notes: string | null;
  recordedById: string | null;
  recordedByUsername: string | null;
  createdAt: string;
  updatedAt: string;
  products: ProductLine[];
  totals: Totals;
}

export interface TemplatePump {
  pumpId: string;
  name: string;
  product: Product;
  pricePerLitre: number | null;
  /** Last recorded closing reading, carried over as today's opening. */
  openingReading: number | null;
}

export interface TemplateReservoir {
  reservoirId: string;
  product: Product;
  capacityLitres: number;
  openingLevel: number | null;
}

export interface DailyRecordTemplate {
  station: { id: string; name: string; code: string };
  recordedOn: string;
  lastRecordedOn: string | null;
  pumps: TemplatePump[];
  reservoirs: TemplateReservoir[];
}

export interface PumpReadingInput {
  pumpId: string;
  openingReading: number;
  closingReading: number;
}

export interface ReservoirReadingInput {
  reservoirId: string;
  openingLevel: number;
  deliveredLitres?: number;
  closingLevel: number;
}

export interface CreateDailyRecordPayload {
  stationId?: string;
  recordedOn: string;
  notes?: string;
  pumps: PumpReadingInput[];
  reservoirs: ReservoirReadingInput[];
}

export type UpdateDailyRecordPayload = Omit<CreateDailyRecordPayload, 'stationId' | 'recordedOn'>;

export interface DailyRecordsQuery {
  /** null means the caller's own station (managers) or every station (directors, admins). */
  stationId: string | null;
  from: string;
  to: string;
}

export type VarianceSeverity = 'ok' | 'warn' | 'bad' | 'none';

/** Within 1% of expected is normal meter drift; up to 5% worth a look; beyond that something is off. */
export function varianceSeverity(variance: number | null, expected: number | null): VarianceSeverity {
  if (variance === null || expected === null) return 'none';
  if (expected === 0) return variance === 0 ? 'ok' : 'bad';
  const pct = Math.abs(variance) / Math.abs(expected);
  if (pct <= 0.01) return 'ok';
  if (pct <= 0.05) return 'warn';
  return 'bad';
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
