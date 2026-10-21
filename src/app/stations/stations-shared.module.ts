import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservoirGaugesComponent } from './components/reservoir-gauges/reservoir-gauges';
import { RecordLevelsModalComponent } from './components/record-levels-modal/record-levels-modal';

/** Station widgets reused outside the stations routes (e.g. the manager's My Station page). */
@NgModule({
  declarations: [ReservoirGaugesComponent, RecordLevelsModalComponent],
  imports: [CommonModule],
  exports: [ReservoirGaugesComponent, RecordLevelsModalComponent],
})
export class StationsSharedModule {}
