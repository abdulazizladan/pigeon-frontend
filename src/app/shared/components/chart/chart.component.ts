import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-chart',
    template: `
    <div class="chart-container relative h-full w-full">
      <canvas baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="chartType">
      </canvas>
    </div>
  `,
    standalone: true,
    imports: [BaseChartDirective],
    styles: [`
    .chart-container {
      position: relative;
      height: 300px; /* Default height */
      width: 100%;
    }
  `]
})
export class ChartComponent implements OnInit {
    @Input() chartType: ChartType = 'bar';
    @Input() chartData: ChartData<'bar' | 'line'> = {
        labels: [],
        datasets: []
    };
    @Input() title: string = '';

    public chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: !!this.title,
                text: this.title
            }
        }
    };

    ngOnInit(): void {
        if (this.title && this.chartOptions?.plugins?.title) {
            this.chartOptions.plugins.title.text = this.title;
            this.chartOptions.plugins.title.display = true;
        }
    }
}
