import {AfterViewInit, Component, effect, inject, ViewChild} from '@angular/core';
import {AdminService} from '../../../core/services/admin.service';
import {ThemeService} from '../../../core/services/theme.service';
import { ReactiveFormsModule } from '@angular/forms';

import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTheme,
  ApexTooltip,
  ChartComponent
} from "ng-apexcharts";
import {FormControl} from '@angular/forms';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xAxis: ApexXAxis;
  yAxis: ApexYAxis;
  legend: ApexLegend;
  fill: ApexFill;
  theme: ApexTheme;
  tooltip: ApexTooltip;
  colors: string[];
};

@Component({
  selector: 'app-dashboard-monthly-revenue',
  imports: [
    ChartComponent,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard-monthly-revenue.component.html',
  styleUrl: './dashboard-monthly-revenue.component.scss'
})
export class DashboardMonthlyRevenueComponent implements AfterViewInit {
  @ViewChild("chart") chart!: ChartComponent;
  private readonly adminService = inject(AdminService);
  private readonly themeService = inject(ThemeService);
  protected chartOptions: Partial<ChartOptions>;
  protected colors: string[] = ["#008FFB", "#4caf50", "#FF9800", "#FF4560"];
  dataFilterControl = new FormControl('reservationStartDate');

  constructor() {
    const theme = this.themeService.currentTheme();
    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: "100%",
        width: "100%",
        foreColor: this.getChartForeColor(theme),
        background: "none",
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false
        }
      },
      responsive: [
        {
          breakpoint: 1536,
          options: {
            legend: {
              position: "bottom",
              offsetY: 10
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  total: {
                    enabled: false
                  }
                }
              }
            },
            dataLabels: {
              enabled: false,
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: false,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 600,
                color: theme === 'dark' ? '#fff' : '#000'
              },
              formatter: (val) => {
                return "$" + val!.toLocaleString();
              }
            }
          }
        }
      },
      xAxis: {
        type: "category",
        categories: []
      },
      yAxis: {
        labels: {
          formatter: (val) => {
            return "$" + val!.toString();
          }
        }
      },
      legend: {
        position: "bottom",
        offsetY: 20
      },
      theme: {
        mode: theme
      },
      fill: {
        opacity: 1
      }
    };

    effect(() => {
      const theme = this.themeService.currentTheme();
      this.setChartThemeOptions(theme);
      if (this.chart) {
        this.chart.updateOptions(this.chartOptions, false, true)
          .then(() => {});
      }
    });

    this.dataFilterControl.valueChanges.subscribe(value => {
      this.loadChartData(value);
    });
  }

  ngAfterViewInit() {
    this.loadChartData(this.dataFilterControl.value);
  }

  loadChartData(type: string | null) {
    if (type === 'reservationStartDate') {
      this.getMonthlyReservationRevenueData();
    } else {
      this.getMonthlyOrderRevenueData();
    }
  }

  getMonthlyOrderRevenueData() {
    this.adminService.getMonthlyOrderRevenue().subscribe(revenueData =>{
      this.chartOptions.series = revenueData.datasets.map((dataset, index) => ({
        name: dataset.campground,
        data: dataset.revenue,
        color: this.colors[index % this.colors.length]
      }));
      this.chartOptions.xAxis = {
        type: "category",
        categories: revenueData.months
      };
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions, false, true);
      }
    });
  }

  getMonthlyReservationRevenueData() {
    this.adminService.getMonthlyReservationRevenue().subscribe(revenueData =>{
      this.chartOptions.series = revenueData.datasets.map((dataset, index) => ({
        name: dataset.campground,
        data: dataset.revenue,
        color: this.colors[index % this.colors.length]
      }));
      this.chartOptions.xAxis = {
        type: "category",
        categories: revenueData.months
      };
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions, false, true);
      }
    });
  }

  private setChartThemeOptions(theme: 'dark' | 'light') {
    document.documentElement.style.setProperty('--tooltip-bg', theme === 'dark' ? '#424242' : '#fff');
    document.documentElement.style.setProperty('--tooltip-color', theme === 'dark' ? '#fff' : '#333');
    document.documentElement.style.setProperty('--tooltip-title-bg', theme === 'dark' ? '#373737' : '#f8f8f8');
    document.documentElement.style.setProperty('--grid-line-color', theme === 'dark' ? '#424242' : '#e0e0e0');
    this.chartOptions.plotOptions!.bar!.dataLabels!.total!.style!.color = theme === 'dark' ? '#fff' : '#000';
    this.chartOptions.chart!.foreColor = this.getChartForeColor(theme);
    this.chartOptions.chart!.background = "none";
    this.chartOptions.theme!.mode = theme;
  }

  private getChartForeColor(theme?: string): string {
    const currentTheme = theme || this.themeService.currentTheme();
    return currentTheme === 'dark' ? '#DDD' : '#333';
  }
}
