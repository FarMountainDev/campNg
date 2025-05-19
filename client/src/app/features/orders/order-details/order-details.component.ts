import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from '../../../core/services/order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Order} from '../../../shared/models/order';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {PaymentCardPipe} from '../../../shared/pipes/payment-card.pipe';
import {ReservationService} from '../../../core/services/reservation.service';
import {getDateFromDateOnlyString} from '../../../shared/utils/date-utils';
import {PascalCaseToWordsPipe} from '../../../shared/pipes/pascal-to-words';
import {AdminService} from '../../../core/services/admin.service';
import {AccountService} from '../../../core/services/account.service';

@Component({
  selector: 'app-order-details',
  imports: [
    MatCardModule,
    MatButton,
    DatePipe,
    CurrencyPipe,
    PaymentCardPipe,
    PascalCaseToWordsPipe
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit{
  protected readonly reservationService = inject(ReservationService);
  private readonly orderService = inject(OrderService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  order?: Order;
  buttonText = this.accountService.isAdmin() ? 'Return to admin' : 'Return to orders';

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;

    const loadOrderData = this.accountService.isAdmin()
      ? this.adminService.getOrder(+id)
      : this.orderService.getOrderDetails(+id);

    loadOrderData.subscribe({
      next: order => this.order = order
    })
  }

  onReturnClick() {
    this.accountService.isAdmin()
      ? this.router.navigateByUrl('/admin/orders')
      : this.router.navigateByUrl('/orders');
  }

  protected readonly getDateFromDateOnlyString = getDateFromDateOnlyString;
}
