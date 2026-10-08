import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyReportComponent } from './components/daily-report/daily-report';
import { DailyRecordsListComponent } from './components/daily-records-list/daily-records-list';
import { RecordDailySalesModalComponent } from './components/record-daily-sales-modal/record-daily-sales-modal';

/** Daily sales pieces shared by the manager shell and the station details page. */
@NgModule({
  declarations: [DailyReportComponent, DailyRecordsListComponent, RecordDailySalesModalComponent],
  imports: [CommonModule],
  exports: [DailyReportComponent, DailyRecordsListComponent, RecordDailySalesModalComponent],
})
export class SalesSharedModule {}
