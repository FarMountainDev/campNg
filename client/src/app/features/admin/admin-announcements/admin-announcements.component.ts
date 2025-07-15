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
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel, MatPrefix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {MatTooltip} from '@angular/material/tooltip';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../../shared/models/user';
import {DialogService} from '../../../core/services/dialog.service';
import {SnackbarService} from '../../../core/services/snackbar.service';
import {ImmediateErrorStateMatcher} from '../../../shared/utils/immediate-error-state-matcher';
import {Campground} from '../../../shared/models/campground';

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
    MatNoDataRow,
    NgClass
  ],
  templateUrl: './admin-announcements.component.html',
  styleUrl: './admin-announcements.component.scss'
})
export class AdminAnnouncementsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  private readonly snackbar = inject(SnackbarService);
  displayedColumns: string[] = ['id', 'title', 'expirationDate', 'forceGlobal', 'pinnedPriority', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'actions'];
  dataSource = new MatTableDataSource<AnnouncementDto>([]);
  announcementParams = new AnnouncementParams();
  totalItems = 0;
  searchForm = new FormGroup({
    searchInput: new FormControl<string>('', [
      Validators.pattern(/^[a-zA-Z0-9._%+-@]*$/)
    ]),
    campgroundSelect: new FormControl<number[]>([]),
    messageTypeSelect: new FormControl()
  });
  immediateErrorMatcher = new ImmediateErrorStateMatcher();
  campgroundOptions: Campground[] = [];

  ngOnInit() {
    this.loadAnnouncements();
    this.loadCampgroundOptions();
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

  private loadCampgroundOptions() {
    this.adminService.getCampgroundSelectOptions().subscribe({
      next: options => {
        this.campgroundOptions = options;
      },
      error: error => {
        console.error('Failed to load campground options:', error);
        this.snackbar.error('Failed to load campground options');
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

  onSearch(searchTerm: string) {
    this.announcementParams.search = searchTerm;
    this.announcementParams.pageNumber = 1;
    this.loadAnnouncements();
  }

  onCampgroundSelect() {
    // TODO: Determine if loading announcements for each selection change can be optimized
    this.announcementParams.campgrounds = this.searchForm.controls.campgroundSelect.value;
    this.announcementParams.pageNumber = 1;
    this.loadAnnouncements();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.announcementParams.search = this.searchForm.controls.searchInput.value ?? '';
      this.announcementParams.campgrounds = this.searchForm.controls.campgroundSelect.value;
      this.announcementParams.pageNumber = 1;
      this.loadAnnouncements();
    }
  }

  onResetFilters() {
    this.announcementParams.pageNumber = 1;
    this.announcementParams.search = '';
    this.announcementParams.campgrounds = [];
    this.searchForm.controls.searchInput.setValue('');
    this.searchForm.controls.campgroundSelect.setValue([]);
    this.searchForm.controls.messageTypeSelect.setValue('');
    this.loadAnnouncements();
  }

  async openAnnouncementDetailsDialog(user: User) {
    this.snackbar.info('Admin announcement details are not available yet.');
  }

  getMessageTypeTextClass(messageType: string): string {
    switch (messageType) {
      case 'Info':
        return 'text-info';
      case 'Success':
        return 'text-success';
      case 'Warning':
        return 'text-warning';
      case 'Error':
        return 'text-error';
      default:
        return 'text-default';
    }
  }
}
