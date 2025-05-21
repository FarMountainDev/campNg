import {Component, inject, OnInit} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {AdminService} from '../../../core/services/admin.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {DatePipe, NgIf} from '@angular/common';
import {MatLabel} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {PaginationParams} from '../../../shared/models/paginationParams';
import {User} from '../../../shared/models/user';


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
    DatePipe
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit{
  private readonly adminService = inject(AdminService);
  displayedColumns: string[] = ['id', 'userName', 'email', 'firstName', 'lastName', 'createdAt', 'isEmailConfirmed', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  paginationParams = new PaginationParams();
  totalItems = 0;
  searchForm = new FormGroup({
    searchInput: new FormControl<string>('', [
      Validators.pattern(/^[a-zA-Z0-9._%+-@]*$/)
    ])
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.paginationParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data
          this.totalItems = response.count;
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSearch(searchTerm: string) {
    this.paginationParams.search = searchTerm;
    this.paginationParams.pageNumber = 1;
    this.loadUsers();
  }

  onSort(event: Sort) {
    this.paginationParams.sort = event.active;
    this.paginationParams.sortDirection = event.direction;
    this.loadUsers();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.paginationParams.search = this.searchForm.controls.searchInput.value!;
      this.paginationParams.pageNumber = 1;
      this.loadUsers();
    }
  }

  onResetFilters() {
    this.paginationParams.pageNumber = 1;
    this.paginationParams.search = '';
    this.searchForm.controls.searchInput.setValue('');
    this.loadUsers();
  }
}
