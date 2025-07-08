import {Component, inject, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef, MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {AnnouncementDto} from '../../../shared/models/announcementDto';
import {AdminService} from '../../../core/services/admin.service';
import {AnnouncementParams} from '../../../shared/models/params/announcementParams';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {DatePipe, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel, MatPrefix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {MatTooltip} from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {User} from '../../../shared/models/user';
import {DialogService} from '../../../core/services/dialog.service';
import {SnackbarService} from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-admin-announcements',
  imports: [
    DatePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatError,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatPaginator,
    MatPrefix,
    MatRow,
    MatRowDef,
    MatSelect,
    MatSort,
    MatSortHeader,
    MatTable,
    MatTooltip,
    NgIf,
    ReactiveFormsModule,
    MatHeaderCellDef,
    MatNoDataRow
  ],
  templateUrl: './admin-announcements.component.html',
  styleUrl: './admin-announcements.component.scss'
})
export class AdminAnnouncementsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  private readonly snackbar = inject(SnackbarService);
  displayedColumns: string[] = ['id', 'title', 'expirationDate', 'messageType', 'forceGlobal', 'pinnedPriority', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];
  dataSource = new MatTableDataSource<AnnouncementDto>([]);
  announcementParams = new AnnouncementParams();
  totalItems = 0;

  ngOnInit() {
    this.loadAnnouncements();
  }

  loadAnnouncements() {
    this.adminService.getAnnouncements(this.announcementParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.announcementParams.pageNumber = event.pageIndex + 1;
    this.announcementParams.pageSize = event.pageSize;
    this.loadAnnouncements();
  }

  onSort(event: Sort) {
    this.announcementParams.sort = event.active;
    this.announcementParams.sortDirection = event.direction;
    this.loadAnnouncements();
  }

  async openAnnouncementDetailsDialog(user: User) {
    this.snackbar.warning('Admin announcement details are not available yet.');
  }
}
