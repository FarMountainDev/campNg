import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {CampgroundsComponent} from './features/campgrounds/campgrounds.component';
import {CampgroundDetailsComponent} from './features/campgrounds/campground-details/campground-details.component';
import {ReservationsComponent} from './features/reservations/reservations.component';
import {NotFoundComponent} from './shared/components/not-found/not-found.component';
import {ServerErrorComponent} from './shared/components/server-error/server-error.component';
import {TestErrorComponent} from './features/test-error/test-error.component';
import {CartComponent} from './features/cart/cart.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'campgrounds', component: CampgroundsComponent},
  {path: 'campgrounds/:id', component: CampgroundDetailsComponent},
  {path: 'reservations', component: ReservationsComponent},
  {path: 'cart', component: CartComponent},
  {path: 'test-error', component: TestErrorComponent},
  {path: 'not-found', component: NotFoundComponent},
  {path: 'server-error', component: ServerErrorComponent},
  {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];
