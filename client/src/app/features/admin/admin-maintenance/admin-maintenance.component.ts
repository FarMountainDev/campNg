import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {AdminService} from '../../../core/services/admin.service';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {DialogService} from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-maintenance',
  imports: [
    MatButton,
    MatTooltip,
    MatIcon,
    MatDivider
  ],
  templateUrl: './admin-maintenance.component.html',
  styleUrl: './admin-maintenance.component.scss'
})
export class AdminMaintenanceComponent {
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  private readonly snackbar = inject(SnackbarService);
  cacheCleared = false;

  async openConfirmClearCacheDialog() {
    const confirmed = await this.dialogService.confirm(
      'Confirm clear cache',
      'All entries in the Redis API cache will be deleted. Are you sure you want to clear the cache?'
    )
    if (confirmed) {
      this.clearApiCache();
    }
  }

  clearApiCache() {
    this.adminService.clearApiCache().subscribe({
      next: () => {
        this.cacheCleared = true;
        this.snackbar.success('API cache cleared successfully.');
      },
      error: () => {
        this.snackbar.error('Failed to clear API cache.');
      }
    });
  }
}
