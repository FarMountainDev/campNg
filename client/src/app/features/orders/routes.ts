import {Route} from '@angular/router';
import {OrdersComponent} from './orders.component';
import {authGuard} from '../../core/guards/auth.guard';
import {OrderDetailsComponent} from './order-details/order-details.component';

export const orderRoutes: Route[] = [
  {path: '', component: OrdersComponent, canActivate: [authGuard]},
  {path: ':id', component: OrderDetailsComponent, canActivate: [authGuard]}
]
