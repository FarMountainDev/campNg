import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {CampgroundsComponent} from './features/campgrounds/campgrounds.component';
import {CampgroundDetailsComponent} from './features/campgrounds/campground-details/campground-details.component';
import {ReservationsComponent} from './features/reservations/reservations.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'campgrounds', component: CampgroundsComponent},
  {path: 'campgrounds/:id', component: CampgroundDetailsComponent},
  {path: 'reservations', component: ReservationsComponent},
  {path: '**', redirectTo: '', pathMatch: 'full'},
];
