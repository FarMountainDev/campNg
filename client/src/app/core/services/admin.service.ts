import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams } from '@angular/common/http';
import {OrderParams} from '../../shared/models/params/orderParams';
import {Pagination} from '../../shared/models/pagination';
import {Order} from '../../shared/models/order';
import {PaginationParams} from '../../shared/models/params/paginationParams';
import {ReservationDto} from '../../shared/models/reservationDto';
import {OccupancyRate} from '../../shared/models/occupancyRate';
import {MonthlyRevenue} from '../../shared/models/monthlyRevenue';
import {User} from '../../shared/models/user';
import {UserParams} from '../../shared/models/params/userParams';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getUsers(userParams: UserParams) {
    let params = new HttpParams();
    if (userParams.role && userParams.role !== 'All') {
      params = params.append('role', userParams.role);
    }
    if (userParams.status && userParams.status !== 'All') {
      params = params.append('status', userParams.status);
    }
    if (userParams.search) {
        params = params.append('search', userParams.search);
    }
    if (userParams.sort && userParams.sortDirection) {
        params = params.append('sort', userParams.sort);
        params = params.append('sortDirection', userParams.sortDirection);
    }
    params = params.append('pageNumber', userParams.pageNumber);
    params = params.append('pageSize', userParams.pageSize);
    return this.http.get<Pagination<User>>(this.baseUrl + 'admin/users', {params});
  }

  lockUser(id: string) {
    return this.http.post<User>(this.baseUrl + 'admin/users/lock/' + id, {});
  }

  unlockUser(id: string) {
    return this.http.post<User>(this.baseUrl + 'admin/users/unlock/' + id, {});
  }

  addModerator(id: string) {
    return this.http.post<User>(this.baseUrl + 'admin/users/add-mod/' + id, {});
  }

  removeModerator(id: string) {
    return this.http.post<User>(this.baseUrl + 'admin/users/remove-mod/' + id, {});
  }

  updateUser(user: User) {
    return this.http.put<User>(this.baseUrl + 'admin/users/update/', user).pipe(
      tap((updatedItem) => {
        console.log('Item updated successfully:', updatedItem);
      })
    );
  }

  getReservations(paginationParams: PaginationParams) {
    let params = new HttpParams();
    if (paginationParams.search) {
        params = params.append('search', paginationParams.search);
    }
    if (paginationParams.sort && paginationParams.sortDirection) {
        params = params.append('sort', paginationParams.sort);
        params = params.append('sortDirection', paginationParams.sortDirection);
    }
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    return this.http.get<Pagination<ReservationDto>>(this.baseUrl + 'admin/reservations', {params});
  }

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.status && orderParams.status !== 'All') {
        params = params.append('status', orderParams.status);
    }
    if (orderParams.search) {
        params = params.append('search', orderParams.search);
    }
    if (orderParams.sort && orderParams.sortDirection) {
        params = params.append('sort', orderParams.sort);
        params = params.append('sortDirection', orderParams.sortDirection);
    }
    params = params.append('pageNumber', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }

  getTodayCheckIns(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    return this.http.get<Pagination<ReservationDto>>(this.baseUrl + 'admin/dashboard/check-ins', {params});
  }

  getTodayCheckOuts(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('pageNumber', paginationParams.pageNumber);
    params = params.append('pageSize', paginationParams.pageSize);
    return this.http.get<Pagination<ReservationDto>>(this.baseUrl + 'admin/dashboard/check-outs', {params});
  }

  getTodayOccupancy() {
    return this.http.get<OccupancyRate[]>(this.baseUrl + 'admin/dashboard/occupancy');
  }

  getMonthlyRevenue() {
    return this.http.get<MonthlyRevenue>(this.baseUrl + 'admin/dashboard/revenue');
  }

  generateMockReservationDtoData(count: number) {
    const mockData: ReservationDto[] = [];
    const today = new Date();

    for (let i = 1; i <= count; i++) {
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 3 + Math.floor(Math.random() * 5));

      mockData.push({
        id: i,
        campsiteId: 100 + Math.floor(Math.random() * 50),
        email: `camper${i}@test.com`,
        startDate: startDate,
        endDate: endDate,
        campsiteName: `Campsite ${100 + Math.floor(Math.random() * 50)}`,
      });
    }

    return mockData;
  }
}
