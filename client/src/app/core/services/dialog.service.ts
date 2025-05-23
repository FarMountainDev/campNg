import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {firstValueFrom} from 'rxjs';
import {AdminUserEditComponent} from '../../features/admin/admin-users/admin-user-edit/admin-user-edit.component';
import {AdminReservationDetailsComponent} from '../../features/admin/admin-reservations/admin-reservation-details/admin-reservation-details.component';
import {AdminOrderDetailsComponent} from '../../features/admin/admin-orders/admin-order-details/admin-order-details.component';
import {User} from '../../shared/models/user';
import {ReservationDto} from '../../shared/models/reservationDto';
import {Order} from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly dialog = inject(MatDialog);

  confirm(title: string,  message: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {title, message}
    });
    return firstValueFrom(dialogRef.afterClosed());
  }

  openAdminUserEdit(user: User) {
    const dialogRef = this.dialog.open(AdminUserEditComponent, {
      data: {user}
    });
    return firstValueFrom(dialogRef.afterClosed());
  }

  openAdminReservationDetails(reservation: ReservationDto) {
    this.dialog.open(AdminReservationDetailsComponent, {
      maxWidth: '1200px',
      data: {reservation}
    });
  }

  openAdminOrderDetails(order: Order) {
    this.dialog.open(AdminOrderDetailsComponent, {
      maxWidth: '1400px',
      data: {order}
    });
  }
}
