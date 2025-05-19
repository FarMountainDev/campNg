import {Component, effect, inject, OnInit, ViewChild} from "@angular/core";
import {AdminService} from '../../../core/services/admin.service';
import {ThemeService} from '../../../core/services/theme.service';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexTheme,
  ApexLegend,
  ApexResponsive,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  theme: ApexTheme;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive | ApexResponsive[];
};

@Component({
  selector: 'app-dashboard-today-occupancy',
  imports: [
    ChartComponent
  ],
  templateUrl: './dashboard-today-occupancy.component.html',
  styleUrl: './dashboard-today-occupancy.component.scss'
})
export class DashboardTodayOccupancyComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  protected readonly adminService = inject(AdminService);
  protected readonly themeService = inject(ThemeService);
  protected chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        height: 420,
        type: "radialBar",
        foreColor: this.getChartForeColor(),
        background: "none"
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px"
            },
            value: {
              fontSize: "16px",
              formatter(val: number): string {
                return val + "%";
              }
            },
            total: {
              show: true,
              label: "Total",
              formatter: function() {
                return "0";
              }
            }
          }
        }
      },
      colors: ["#1ab7ea", "#0084ff", "#39539E"],
      labels: [],
      theme: {
        mode: this.themeService.currentTheme()
      },
      legend: {
        show: true,
        floating: false,
        fontSize: "16px",
        position: "bottom",
        labels: {
          useSeriesColors: true
        },
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
        itemMargin: {
          horizontal: 5
        },
        onItemClick: {
          toggleDataSeries: false
        },
        onItemHover: {
          highlightDataSeries: true
        },
      },
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

  ngOnInit(): void {
    this.getChartData();
  }

  private getChartData() {
    this.adminService.getTodayOccupancy().subscribe(occupancyRates => {
      if (occupancyRates && occupancyRates.length > 0) {
        this.chartOptions.series = occupancyRates.map(rate => rate.percentage);
        this.chartOptions.labels = occupancyRates.map(rate => rate.label);

        const totalOccupied = occupancyRates.reduce((sum, rate) =>
          sum + (rate.occupied || 0), 0);
        const totalCapacity = occupancyRates.reduce((sum, rate) =>
          sum + (rate.total || 0), 0);
        const overallPercentage = totalCapacity > 0
          ? Math.round((totalOccupied / totalCapacity) * 100)
          : 0;

        if (this.chartOptions.plotOptions?.radialBar?.dataLabels?.total) {
          this.chartOptions.plotOptions.radialBar.dataLabels.total.formatter = function() {
            return `${totalOccupied} (${overallPercentage}%)`;
          };
        }
      }
    });
  }

  private getChartForeColor(theme?: string): string {
    const currentTheme = theme || this.themeService.currentTheme();
    return currentTheme === 'dark' ? '#DDD' : '#333';
  }
}
