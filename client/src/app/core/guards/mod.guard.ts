import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AccountService} from '../services/account.service';
import {SnackbarService} from '../services/snackbar.service';

export const modGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  if (accountService.isModerator()) {
    return true;
  } else {
    snackbar.error('Forbidden');
    void router.navigateByUrl('/');
    return false;
  }
};
