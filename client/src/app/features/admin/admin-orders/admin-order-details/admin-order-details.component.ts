import {Component, Inject, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {Order} from '../../../../shared/models/order';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {PascalCaseToWordsPipe} from '../../../../shared/pipes/pascal-to-words';
import {PaymentCardPipe} from '../../../../shared/pipes/payment-card.pipe';
import {getDateFromDateOnlyString} from '../../../../shared/utils/date-utils';
import {ReservationService} from '../../../../core/services/reservation.service';

@Component({
  selector: 'app-admin-order-details',
  imports: [
    DatePipe,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    PascalCaseToWordsPipe,
    CurrencyPipe,
    PaymentCardPipe
  ],
  templateUrl: './admin-order-details.component.html',
  styleUrl: './admin-order-details.component.scss'
})
export class AdminOrderDetailsComponent {
  protected readonly reservationService = inject(ReservationService);
  private readonly dialogRef = inject(MatDialogRef<AdminOrderDetailsComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: {order:Order}) { }

  onCancel() {
    this.dialogRef.close();
  }

  protected readonly getDateFromDateOnlyString = getDateFromDateOnlyString;
}
