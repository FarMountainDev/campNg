import {Component, ViewChild} from '@angular/core';

import {
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
  ApexResponsive,
  ApexDataLabels,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};

@Component({
  selector: 'app-dashboard-monthly-columns',
  imports: [
    ChartComponent
  ],
  templateUrl: './dashboard-monthly-columns.component.html',
  styleUrl: './dashboard-monthly-columns.component.scss'
})
export class DashboardMonthlyColumnsComponent {
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "PRODUCT A",
          data: [44, 55, 41, 67, 22, 43, 13, 23, 20, 8, 13, 27]
        },
        {
          name: "PRODUCT B",
          data: [13, 23, 20, 8, 13, 27, 44, 55, 41, 67, 22, 43]
        },
        {
          name: "PRODUCT C",
          data: [11, 17, 15, 15, 21, 14, 21, 7, 25, 13, 22, 8]
        },
        {
          name: "PRODUCT D",
          data: [21, 7, 25, 13, 22, 8, 11, 17, 15, 15, 21, 14]
        }
      ],
      chart: {
        type: "bar",
        height: "100%",
        width: "100%",
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      xaxis: {
        type: "category",
        categories: [
          "11/2024",
          "12/2024",
          "01/2025",
          "02/2025",
          "03/2025",
          "04/2025",
          "05/2025",
          "06/2025",
          "07/2025",
          "08/2025",
          "09/2025",
          "10/2025"
        ]
      },
      legend: {
        position: "bottom",
        offsetY: 20
      },
      fill: {
        opacity: 1
      }
    };
  }
}
