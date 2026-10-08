import { Component, input } from '@angular/core';
import { DailySalesReport, PumpLine, ProductLine, varianceSeverity } from '../../models/daily-sales.model';
import { Product, productLabel } from '../../../stations/models/equipment.model';
import { CURRENCY_CODE } from '../../models/sales.model';

/** Read-only expected-vs-actual breakdown of one trading day, per product and per pump. */
@Component({
  selector: 'app-daily-report',
  standalone: false,
  templateUrl: './daily-report.html',
  styleUrl: './daily-report.css',
})
export class DailyReportComponent {
  readonly report = input.required<DailySalesReport>();
  readonly showNotes = input(true);

  protected readonly currencyCode = CURRENCY_CODE;

  protected label(product: Product): string {
    return productLabel(product);
  }

  protected severity(line: Pick<ProductLine, 'varianceLitres' | 'expectedLitres'> | PumpLine): string {
    return varianceSeverity(line.varianceLitres, line.expectedLitres);
  }

  protected sign(value: number | null): string {
    if (value === null) return '';
    return value > 0 ? '+' : '';
  }

  protected trackProduct(_: number, line: ProductLine): string {
    return line.product;
  }

  protected trackPump(_: number, pump: PumpLine): string {
    return pump.pumpId;
  }
}
