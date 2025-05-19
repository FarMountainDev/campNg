import {Component} from '@angular/core';
import {DashboardMonthlyRevenueComponent} from './dashboard-monthly-columns/dashboard-monthly-revenue.component';
import {DashboardTodayOccupancyComponent} from './dashboard-today-occupancy/dashboard-today-occupancy.component';
import {DashboardTodayCheckInsComponent} from './dashboard-today-check-ins/dashboard-today-check-ins.component';
import {DashboardTodayCheckOutsComponent} from './dashboard-today-check-outs/dashboard-today-check-outs.component';

@Component({
  selector: 'app-admin',
  imports: [
    DashboardMonthlyRevenueComponent,
    DashboardTodayOccupancyComponent,
    DashboardTodayCheckInsComponent,
    DashboardTodayCheckOutsComponent

  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

}
