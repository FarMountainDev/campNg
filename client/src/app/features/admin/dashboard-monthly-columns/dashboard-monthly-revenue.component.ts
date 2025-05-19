import {Component, effect, inject, OnInit, ViewChild} from '@angular/core';
import {AdminService} from '../../../core/services/admin.service';
import {ThemeService} from '../../../core/services/theme.service';

import {
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
  ApexResponsive,
  ApexDataLabels,
  ApexTheme,
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
  theme: ApexTheme;
  colors: string[];
};

@Component({
  selector: 'app-dashboard-monthly-columns',
  imports: [
    ChartComponent
  ],
  templateUrl: './dashboard-monthly-revenue.component.html',
  styleUrl: './dashboard-monthly-revenue.component.scss'
})
export class DashboardMonthlyRevenueComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  private readonly adminService = inject(AdminService);
  private readonly themeService = inject(ThemeService);
  protected chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: "100%",
        width: "100%",
        foreColor: this.getChartForeColor(),
        background: "none",
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
          horizontal: false,
          distributed: false
        }
      },
      xaxis: {
        type: "category",
        categories: []
      },
      legend: {
        position: "bottom",
        offsetY: 20
      },
      theme: {
        mode: this.themeService.currentTheme()
      },
      fill: {
        opacity: 1
      }
    };

    effect(() => {
      const theme = this.themeService.currentTheme();
      this.chart.updateOptions({
        chart: {
          foreColor: this.getChartForeColor(theme),
          background: "none"
        },
        theme: {
          mode: theme
        }
      }, false, false);
    });
  }

  ngOnInit() {
    this.getMonthlyRevenueData();
  }

  getMonthlyRevenueData() {
    this.adminService.getMonthlyRevenue().subscribe(revenueData =>{
      if (revenueData.months.length > 0 && revenueData.datasets.length > 0) {
        const colors: string[] = ["#008FFB", "#4caf50", "#FF9800", "#FF4560"];
        this.chartOptions.series = revenueData.datasets.map((dataset, index) => ({
          name: dataset.campground,
          data: dataset.revenue,
          color: colors[index % colors.length]
        }));
        this.chartOptions.xaxis!.categories = revenueData.months;
      }
    });
  }

  private getChartForeColor(theme?: string): string {
    const currentTheme = theme || this.themeService.currentTheme();
    return currentTheme === 'dark' ? '#DDD' : '#333';
  }
}
