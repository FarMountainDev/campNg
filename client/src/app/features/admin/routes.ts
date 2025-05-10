import {Route} from '@angular/router';
import {AdminComponent} from './admin.component';
import {authGuard} from '../../core/guards/auth.guard';
import {adminGuard} from '../../core/guards/admin.guard';

export const adminRoutes: Route[] = [
  {path: '', component: AdminComponent, canActivate: [authGuard, adminGuard]},
]
