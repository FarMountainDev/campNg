import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {OrderService} from '../services/order.service';

export const orderCompleteGuard: CanActivateFn = (route, state) => {
  const orderService = inject(OrderService);
  const router = inject(Router);

  if (orderService.orderComplete) {
    return true;
  } else {
    void router.navigateByUrl('/shop');
    return false;
  }
};
