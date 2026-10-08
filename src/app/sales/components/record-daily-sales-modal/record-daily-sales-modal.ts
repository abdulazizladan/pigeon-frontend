import { Component, computed, effect, inject, signal } from '@angular/core';
import { DailySalesStore } from '../../store/daily-sales.store';
import {
  CreateDailyRecordPayload,
  TemplatePump,
  TemplateReservoir,
  round2,
  varianceSeverity,
} from '../../models/daily-sales.model';
import { PRODUCTS, Product, productLabel } from '../../../stations/models/equipment.model';
import { CURRENCY_CODE, formatLocalDate } from '../../models/sales.model';

interface PumpInput { opening: string; closing: string }
interface TankInput { opening: string; delivered: string; closing: string }

interface PumpRow {
  pump: TemplatePump;
  input: PumpInput;
  litres: number | null;
  amount: number | null;
  error: string | null;
}

interface TankRow {
  tank: TemplateReservoir;
  input: TankInput;
  expected: number | null;
  error: string | null;
}

interface ProductSummary {
  product: Product;
  price: number | null;
  expectedLitres: number | null;
  actualLitres: number;
  varianceLitres: number | null;
  expectedAmount: number | null;
  actualAmount: number;
  varianceAmount: number | null;
  pumpCount: number;
}

function num(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * The manager's end-of-day form: opening/closing totaliser for every active pump and dip levels
 * for every reservoir. Shows expected vs actual live so mistakes are caught before submitting.
 */
@Component({
  selector: 'app-record-daily-sales-modal',
  standalone: false,
  templateUrl: './record-daily-sales-modal.html',
  styleUrl: './record-daily-sales-modal.css',
})
export class RecordDailySalesModalComponent {
  protected readonly store = inject(DailySalesStore);
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly today = formatLocalDate(new Date());

  protected readonly recordedOn = signal<string>(this.today);
  protected readonly notes = signal<string>('');
  private readonly pumpInputs = signal<Record<string, PumpInput>>({});
  private readonly tankInputs = signal<Record<string, TankInput>>({});

  protected readonly isEditing = computed(() => this.store.editingRecord() !== null);
  protected readonly template = this.store.template;

  protected readonly pumpRows = computed<PumpRow[]>(() => {
    const t = this.template();
    if (!t) return [];
    const inputs = this.pumpInputs();
    return t.pumps.map((pump) => {
      const input = inputs[pump.pumpId] ?? { opening: '', closing: '' };
      const o = num(input.opening);
      const c = num(input.closing);
      let error: string | null = null;
      if (o !== null && o < 0) error = 'Opening cannot be negative.';
      else if (c !== null && c < 0) error = 'Closing cannot be negative.';
      else if (o !== null && c !== null && c < o) error = 'Closing is below opening.';
      const litres = o !== null && c !== null && !error ? round2(c - o) : null;
      const amount = litres !== null && pump.pricePerLitre !== null ? round2(litres * pump.pricePerLitre) : null;
      return { pump, input, litres, amount, error };
    });
  });

  protected readonly tankRows = computed<TankRow[]>(() => {
    const t = this.template();
    if (!t) return [];
    const inputs = this.tankInputs();
    return t.reservoirs.map((tank) => {
      const input = inputs[tank.reservoirId] ?? { opening: '', delivered: '0', closing: '' };
      const o = num(input.opening);
      const d = num(input.delivered) ?? 0;
      const c = num(input.closing);
      let error: string | null = null;
      if (o !== null && o > tank.capacityLitres) error = `Opening level exceeds the ${tank.capacityLitres.toLocaleString()} L capacity.`;
      else if (c !== null && c > tank.capacityLitres) error = `Closing level exceeds the ${tank.capacityLitres.toLocaleString()} L capacity.`;
      else if (d < 0) error = 'Delivered litres cannot be negative.';
      else if (o !== null && c !== null && c > o + d) error = 'Closing level is above opening plus deliveries.';
      const expected = o !== null && c !== null && !error ? round2(o + d - c) : null;
      return { tank, input, expected, error };
    });
  });

  /** Rows grouped for display: pumps of a product under that product's tank. */
  protected readonly products = computed<Product[]>(() => {
    const t = this.template();
    if (!t) return [];
    const present = new Set<Product>([...t.pumps.map((p) => p.product), ...t.reservoirs.map((r) => r.product)]);
    return PRODUCTS.filter((p) => present.has(p));
  });

  protected readonly summaries = computed<ProductSummary[]>(() =>
    this.products().map((product) => {
      const pumps = this.pumpRows().filter((r) => r.pump.product === product);
      const tank = this.tankRows().find((r) => r.tank.product === product) ?? null;
      const price = pumps.find((p) => p.pump.pricePerLitre !== null)?.pump.pricePerLitre ?? null;
      const actualLitres = round2(pumps.reduce((s, p) => s + (p.litres ?? 0), 0));
      const actualAmount = round2(pumps.reduce((s, p) => s + (p.amount ?? 0), 0));
      const expectedLitres = tank?.expected ?? null;
      const expectedAmount = expectedLitres !== null && price !== null ? round2(expectedLitres * price) : null;
      return {
        product,
        price,
        expectedLitres,
        actualLitres,
        varianceLitres: expectedLitres !== null ? round2(actualLitres - expectedLitres) : null,
        expectedAmount,
        actualAmount,
        varianceAmount: expectedAmount !== null ? round2(actualAmount - expectedAmount) : null,
        pumpCount: pumps.length,
      };
    }),
  );

  protected readonly totals = computed(() => {
    const s = this.summaries();
    const actualAmount = round2(s.reduce((a, x) => a + x.actualAmount, 0));
    const expectedAmount = s.every((x) => x.expectedAmount !== null) ? round2(s.reduce((a, x) => a + (x.expectedAmount ?? 0), 0)) : null;
    const actualLitres = round2(s.reduce((a, x) => a + x.actualLitres, 0));
    const expectedLitres = s.every((x) => x.expectedLitres !== null) ? round2(s.reduce((a, x) => a + (x.expectedLitres ?? 0), 0)) : null;
    return { actualAmount, expectedAmount, actualLitres, expectedLitres };
  });

  protected readonly missingPrices = computed(() => {
    const t = this.template();
    return t ? [...new Set(t.pumps.filter((p) => p.pricePerLitre === null).map((p) => p.product))] : [];
  });

  protected readonly isComplete = computed(() => {
    const t = this.template();
    if (!t || t.pumps.length === 0 || t.reservoirs.length === 0) return false;
    if (!this.recordedOn() || this.recordedOn() > this.today) return false;
    if (this.missingPrices().length) return false;
    return (
      this.pumpRows().every((r) => r.litres !== null && !r.error) &&
      this.tankRows().every((r) => r.expected !== null && !r.error)
    );
  });

  constructor() {
    // Fill the form whenever a template arrives: from the record being edited, else carried-over openings.
    effect(() => {
      const t = this.template();
      if (!t) return;
      const record = this.store.editingRecord();
      const pumpLines = new Map(record?.products.flatMap((p) => p.pumps).map((p) => [p.pumpId, p]) ?? []);
      const tankLines = new Map(record?.products.filter((p) => p.reservoir).map((p) => [p.reservoir!.reservoirId, p.reservoir!]) ?? []);

      const pumps: Record<string, PumpInput> = {};
      for (const p of t.pumps) {
        const line = pumpLines.get(p.pumpId);
        pumps[p.pumpId] = {
          opening: line ? String(line.openingReading) : p.openingReading !== null ? String(p.openingReading) : '',
          closing: line ? String(line.closingReading) : '',
        };
      }
      const tanks: Record<string, TankInput> = {};
      for (const r of t.reservoirs) {
        const line = tankLines.get(r.reservoirId);
        tanks[r.reservoirId] = {
          opening: line ? String(line.openingLevel) : r.openingLevel !== null ? String(r.openingLevel) : '',
          delivered: line ? String(line.deliveredLitres) : '0',
          closing: line ? String(line.closingLevel) : '',
        };
      }
      this.pumpInputs.set(pumps);
      this.tankInputs.set(tanks);
      this.recordedOn.set(record ? record.recordedOn : t.recordedOn);
      this.notes.set(record?.notes ?? '');
    });
  }

  protected onClose() {
    this.store.closeRecordModal();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose();
  }

  protected setPump(pumpId: string, field: keyof PumpInput, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.pumpInputs.update((all) => ({ ...all, [pumpId]: { ...(all[pumpId] ?? { opening: '', closing: '' }), [field]: value } }));
  }

  protected setTank(reservoirId: string, field: keyof TankInput, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.tankInputs.update((all) => ({
      ...all,
      [reservoirId]: { ...(all[reservoirId] ?? { opening: '', delivered: '0', closing: '' }), [field]: value },
    }));
  }

  protected setDate(event: Event) {
    this.recordedOn.set((event.target as HTMLInputElement).value);
  }

  protected setNotes(event: Event) {
    this.notes.set((event.target as HTMLTextAreaElement).value);
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    const t = this.template();
    if (!t || !this.isComplete() || this.store.isSaving()) return;
    const record = this.store.editingRecord();
    const notes = this.notes().trim();
    const payload: CreateDailyRecordPayload = {
      ...(record || !this.store.modalStationId() ? {} : { stationId: this.store.modalStationId()! }),
      recordedOn: this.recordedOn(),
      ...(notes ? { notes } : {}),
      pumps: this.pumpRows().map((r) => ({
        pumpId: r.pump.pumpId,
        openingReading: num(r.input.opening)!,
        closingReading: num(r.input.closing)!,
      })),
      reservoirs: this.tankRows().map((r) => ({
        reservoirId: r.tank.reservoirId,
        openingLevel: num(r.input.opening)!,
        deliveredLitres: num(r.input.delivered) ?? 0,
        closingLevel: num(r.input.closing)!,
      })),
    };
    this.store.saveRecord({ recordId: record?.id ?? null, payload });
  }

  protected pumpsFor(product: Product): PumpRow[] {
    return this.pumpRows().filter((r) => r.pump.product === product);
  }

  protected tankFor(product: Product): TankRow | null {
    return this.tankRows().find((r) => r.tank.product === product) ?? null;
  }

  protected summaryFor(product: Product): ProductSummary | undefined {
    return this.summaries().find((s) => s.product === product);
  }

  protected label(product: Product): string {
    return productLabel(product);
  }

  protected severity(variance: number | null, expected: number | null): string {
    return varianceSeverity(variance, expected);
  }

  protected sign(v: number | null): string {
    return v !== null && v > 0 ? '+' : '';
  }
}
