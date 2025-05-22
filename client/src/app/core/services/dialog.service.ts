import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {firstValueFrom} from 'rxjs';
import {User} from '../../shared/models/user';
import {
  AdminUserDetailsComponent
} from '../../features/admin/admin-users/admin-user-details/admin-user-details.component';

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

  openAdminUserDetails(user: User) {
    const dialogRef = this.dialog.open(AdminUserDetailsComponent, {
      data: {user}
    });
    return firstValueFrom(dialogRef.afterClosed());
  }
}
