import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Summary } from './components/summary/summary';
import { Export } from './components/export/export';

const routes: Routes = [
  {
    path: '',
    component: Summary
  },
  {
    path: 'export',
    component: Export
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRecordsManaementRoutingModule { }
