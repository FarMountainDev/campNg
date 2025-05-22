import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {CampgroundsComponent} from './features/campgrounds/campgrounds.component';
import {CampgroundDetailsComponent} from './features/campgrounds/campground-details/campground-details.component';
import {ReservationsComponent} from './features/reservations/reservations.component';
import {CartComponent} from './features/cart/cart.component';
import {authGuard} from './core/guards/auth.guard';
import {DefaultLayoutComponent} from './layout/default-layout/default-layout.component';
import {AdminLayoutComponent} from './layout/admin-layout/admin-layout.component';
import {modGuard} from './core/guards/mod.guard';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {path: '', component: HomeComponent},
      {path: 'campgrounds', component: CampgroundsComponent},
      {path: 'campgrounds/:id', component: CampgroundDetailsComponent},
      {path: 'reservations', component: ReservationsComponent},
      {path: 'cart', component: CartComponent},
      {path: 'checkout', loadChildren: () => import('./features/checkout/routes').then(m => m.checkoutRoutes)},
      {path: 'orders', loadChildren: () => import('./features/orders/routes').then(m => m.orderRoutes)},
      {path: 'account', loadChildren: () => import('./features/account/routes').then(m => m.accountRoutes)},
      {path: 'test-error', loadComponent: () => import('./features/test-error/test-error.component').then(m => m.TestErrorComponent)},
      {path: 'not-found', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)},
      {path: 'server-error', loadComponent: () => import('./shared/components/server-error/server-error.component').then(m => m.ServerErrorComponent)},
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, modGuard],
    children: [
      {path: '', loadChildren: () => import('./features/admin/routes').then(m => m.adminRoutes), canActivate: [authGuard, modGuard]},
    ]
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  }
];
