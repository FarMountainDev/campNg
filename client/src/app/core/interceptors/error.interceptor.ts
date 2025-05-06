﻿import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {SnackbarService} from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        if (error.error.errors) {
          const modelStateErrors: string[] = [];
          for (const key in error.error.errors) {
            if (error.error.errors[key]) {
              modelStateErrors.push(error.error.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        } else {
          snackbar.error(error.error.title || error.error);
        }
      }
      if (error.status === 401) {
        snackbar.error(error.error.title || error.error);
      }
      if (error.status === 403) {
        snackbar.error('Forbidden');
      }
      if (error.status === 404) {
        void router.navigateByUrl('/not-found');
      }
      if (error.status === 500) {
        const navigationExtras: NavigationExtras = {state: {error: error.error}};
        void router.navigateByUrl('/server-error', navigationExtras);
      }
      return throwError(() => error);
    })
  )
};
