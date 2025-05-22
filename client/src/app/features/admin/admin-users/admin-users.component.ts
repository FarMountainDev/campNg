import {Component, inject, OnInit} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {AdminService} from '../../../core/services/admin.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {DatePipe, NgIf} from '@angular/common';
import {MatLabel} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {User} from '../../../shared/models/user';
import {DialogService} from '../../../core/services/dialog.service';
import {UserParams} from '../../../shared/models/params/userParams';
import {IsAdminDirective} from '../../../shared/directives/is-admin.directive';
import {AccountService} from '../../../core/services/account.service';
import {SnackbarService} from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-admin-users',
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatLabel,
    MatInput,
    MatButton,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatSortHeader,
    MatSort,
    DatePipe,
    IsAdminDirective
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit{
  protected readonly accountService = inject(AccountService);
  private readonly adminService = inject(AdminService);
  private readonly dialogService = inject(DialogService);
  private readonly snackbar = inject(SnackbarService);
  displayedColumns: string[] = ['id', 'userName', 'email', 'firstName', 'lastName', 'createdAt', 'isEmailConfirmed', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  userParams = new UserParams();
  totalItems = 0;
  statusOptions = ['All', 'Active', 'Locked'];
  roleOptions = ['All', 'Member', 'Moderator', 'Admin'];
  searchForm = new FormGroup({
    searchInput: new FormControl<string>('', [
      Validators.pattern(/^[a-zA-Z0-9._%+-@]*$/)
    ]),
    userStatusSelect: new FormControl(),
    userRoleSelect: new FormControl()
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.userParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.userParams.pageNumber = event.pageIndex + 1;
    this.userParams.pageSize = event.pageSize;
    this.loadUsers();
  }

  onFilterRoleSelect(event: MatSelectChange) {
    this.userParams.role = event.value;
    this.userParams.pageNumber = 1;
    this.loadUsers();
  }

  onFilterStatusSelect(event: MatSelectChange) {
    this.userParams.status = event.value;
    this.userParams.pageNumber = 1;
    this.loadUsers();
  }

  onSearch(searchTerm: string) {
    this.userParams.search = searchTerm;
    this.userParams.pageNumber = 1;
    this.loadUsers();
  }

  onSort(event: Sort) {
    this.userParams.sort = event.active;
    this.userParams.sortDirection = event.direction;
    this.loadUsers();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.userParams.search = this.searchForm.controls.searchInput.value!;
      this.userParams.role = this.searchForm.controls.userRoleSelect.value;
      this.userParams.status = this.searchForm.controls.userStatusSelect.value;
      this.userParams.pageNumber = 1;
      this.loadUsers();
    }
  }

  onResetFilters() {
    this.userParams.pageNumber = 1;
    this.userParams.search = '';
    this.userParams.role = '';
    this.userParams.status = '';
    this.searchForm.controls.searchInput.setValue('');
    this.searchForm.controls.userRoleSelect.setValue('');
    this.searchForm.controls.userStatusSelect.setValue('');
    this.loadUsers();
  }

  async openUserDetailsDialog(user: User) {
    const userDetails = {...user};
    const userResult: User = await this.dialogService.openAdminUserDetails(userDetails);
    if (userResult) {
      this.updateUser(userResult);
    }
  }

  updateUser(user: User) {
    this.adminService.updateUser(user).subscribe({
      next: (updatedUser) => {
        this.dataSource.data = this.dataSource.data.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
        this.snackbar.success('User updated successfully');
      }
    });
  }

  async openLockConfirmDialog(id: string) {
    const confirmed = await this.dialogService.confirm(
      'Confirm lock-out',
      'Are you sure you want to lock this user?'
    )
    if (confirmed) {
      this.lockUser(id);
    }
  }

  lockUser(id: string) {
    this.adminService.lockUser(id).subscribe({
      next: user => {
        this.dataSource.data = this.dataSource.data.map(u => u.id === id ? user : u)
      }
    });
  }

  async openUnlockConfirmDialog(id: string) {
    const confirmed = await this.dialogService.confirm(
      'Confirm reactivation',
      'Are you sure you want to unlock this user?'
    )
    if (confirmed) {
      this.unlockUser(id);
    }
  }

  unlockUser(id: string) {
    this.adminService.unlockUser(id).subscribe({
      next: user => {
        this.dataSource.data = this.dataSource.data.map(u => u.id === id ? user : u)
      }
    });
  }

  async openAddModeratorConfirmDialog(id: string) {
    const confirmed = await this.dialogService.confirm(
      'Confirm add moderator',
      'Are you sure you want to add this user as a moderator?'
    )
    if (confirmed) {
      this.addModerator(id);
    }
  }

  addModerator(id: string) {
    this.adminService.addModerator(id).subscribe({
      next: user => {
        this.dataSource.data = this.dataSource.data.map(u => u.id === id ? user : u)
      }
    });
  }

  async openRemoveModeratorConfirmDialog(id: string) {
    const confirmed = await this.dialogService.confirm(
      'Confirm remove moderator',
      'Are you sure you want to remove this user as a moderator?'
    )
    if (confirmed) {
      this.removeModerator(id);
    }
  }

  removeModerator(id: string) {
    this.adminService.removeModerator(id).subscribe({
      next: user => {
        this.dataSource.data = this.dataSource.data.map(u => u.id === id ? user : u)
      }
    });
  }

  hasRole(user: User, role: string): boolean {
    if (!user.roles) return false;

    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    } else {
      return user.roles === role || user.roles.split(',').map(r => r.trim()).includes(role);
    }
  }
}
