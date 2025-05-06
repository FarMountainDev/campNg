import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {CampgroundsComponent} from './features/campgrounds/campgrounds.component';
import {CampgroundDetailsComponent} from './features/campgrounds/campground-details/campground-details.component';
import {ReservationsComponent} from './features/reservations/reservations.component';
import {NotFoundComponent} from './shared/components/not-found/not-found.component';
import {ServerErrorComponent} from './shared/components/server-error/server-error.component';
import {TestErrorComponent} from './features/test-error/test-error.component';
import {CartComponent} from './features/cart/cart.component';
import {CheckoutComponent} from './features/checkout/checkout.component';
import {authGuard} from './core/guards/auth.guard';
import {emptyCartGuard} from './core/guards/empty-cart.guard';
import {LoginComponent} from './features/account/login/login.component';
import {RegisterComponent} from './features/account/register/register.component';
import {CheckoutSuccessComponent} from './features/checkout/checkout-success/checkout-success.component';
import {OrderDetailsComponent} from './features/orders/order-details/order-details.component';
import {OrdersComponent} from './features/orders/orders.component';
import {orderCompleteGuard} from './core/guards/order-complete.guard';
import {AdminComponent} from './features/admin/admin.component';
import {adminGuard} from './core/guards/admin.guard';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'campgrounds', component: CampgroundsComponent},
  {path: 'campgrounds/:id', component: CampgroundDetailsComponent},
  {path: 'reservations', component: ReservationsComponent},
  {path: 'cart', component: CartComponent},
  {path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, emptyCartGuard]},
  {path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard, orderCompleteGuard]},
  {path: 'orders', component: OrdersComponent, canActivate: [authGuard]},
  {path: 'orders/:id', component: OrderDetailsComponent, canActivate: [authGuard]},
  {path: 'account/login', component: LoginComponent},
  {path: 'account/register', component: RegisterComponent},
  {path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard]},
  {path: 'test-error', component: TestErrorComponent},
  {path: 'not-found', component: NotFoundComponent},
  {path: 'server-error', component: ServerErrorComponent},
  {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];
