import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DailyReportComponent } from './components/daily-report/daily-report';
import { DailyRecordsListComponent } from './components/daily-records-list/daily-records-list';
import { RecordDailySalesModalComponent } from './components/record-daily-sales-modal/record-daily-sales-modal';
import { StationSalesChartComponent } from './components/station-sales-chart/station-sales-chart';

/** Daily sales pieces shared by the manager shell and the station details page. */
@NgModule({
  declarations: [DailyReportComponent, DailyRecordsListComponent, RecordDailySalesModalComponent, StationSalesChartComponent],
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  exports: [DailyReportComponent, DailyRecordsListComponent, RecordDailySalesModalComponent, StationSalesChartComponent],
})
export class SalesSharedModule {}
