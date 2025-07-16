import {Route} from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {AdminOrdersComponent} from './admin-orders/admin-orders.component';
import {AdminUsersComponent} from './admin-users/admin-users.component';
import {AdminAnnouncementsComponent} from './admin-announcements/admin-announcements.component';
import {AdminCampgroundsComponent} from './admin-campgrounds/admin-campgrounds.component';
import {AdminReservationsComponent} from './admin-reservations/admin-reservations.component';
import {AdminMaintenanceComponent} from './admin-maintenance/admin-maintenance.component';

export const adminRoutes: Route[] = [
  {path: '', component: AdminDashboardComponent},
  {path: 'orders', component: AdminOrdersComponent},
  {path: 'reservations', component: AdminReservationsComponent},
  {path: 'users', component: AdminUsersComponent},
  {path: 'campgrounds', component: AdminCampgroundsComponent},
  {path: 'announcements', component: AdminAnnouncementsComponent},
  {path: 'maintenance', component: AdminMaintenanceComponent}
]
