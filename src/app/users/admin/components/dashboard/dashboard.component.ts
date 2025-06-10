import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminStore } from '../../store/admin.store';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { usersSummary } from '../../models/users-summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  public adminStore = inject(AdminStore);

  constructor() {

  }

  ngOnInit() {
    this.adminStore.loadSummary();
  }

  summary = this.adminStore.usersSummary();

  public pieChartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      /**datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
          return '';
        },
      },**/
    },
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'],
    datasets: [
      {
        data: [300, 500, 100],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';

}
