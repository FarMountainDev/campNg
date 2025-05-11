import {Route} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AdminOrdersComponent} from './admin-orders/admin-orders.component';
import {AdminUsersComponent} from './admin-users/admin-users.component';
import {AdminAnnouncementsComponent} from './admin-announcements/admin-announcements.component';
import {AdminCampgroundsComponent} from './admin-campgrounds/admin-campgrounds.component';
import {AdminReservationsComponent} from './admin-reservations/admin-reservations.component';

export const adminRoutes: Route[] = [
  {path: '', component: AdminComponent},
  {path: 'orders', component: AdminOrdersComponent},
  {path: 'reservations', component: AdminReservationsComponent},
  {path: 'users', component: AdminUsersComponent},
  {path: 'campgrounds', component: AdminCampgroundsComponent},
  {path: 'announcements', component: AdminAnnouncementsComponent}
]
