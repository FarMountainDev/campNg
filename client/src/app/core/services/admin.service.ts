import {inject, Injectable, signal} from '@angular/core';
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
import {AnnouncementDto} from '../../shared/models/announcementDto';
import {AnnouncementParams} from '../../shared/models/params/announcementParams';
import {Campground} from '../../shared/models/campground';
import {Observable, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private campgroundOptions = signal<Campground[] | null>(null);

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
    return this.http.put<User>(this.baseUrl + 'admin/users/update/', user).pipe();
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

  getMonthlyOrderRevenue() {
    return this.http.get<MonthlyRevenue>(this.baseUrl + 'admin/dashboard/revenue/orders');
  }

  getMonthlyReservationRevenue() {
    return this.http.get<MonthlyRevenue>(this.baseUrl + 'admin/dashboard/revenue/reservations');
  }

  getAnnouncements(announcementParams: AnnouncementParams) {
    let params = new HttpParams();
    if (announcementParams.campgrounds && announcementParams.campgrounds.length > 0) {
      params = params.append('campgrounds', announcementParams.campgrounds.join(','));
      console.log(announcementParams.campgrounds);
    }
    if (announcementParams.search) {
      params = params.append('search', announcementParams.search);
    }
    if (announcementParams.sort && announcementParams.sortDirection) {
      params = params.append('sort', announcementParams.sort);
      params = params.append('sortDirection', announcementParams.sortDirection);
    }
    params = params.append('pageNumber', announcementParams.pageNumber);
    params = params.append('pageSize', announcementParams.pageSize);
    return this.http.get<Pagination<AnnouncementDto>>(this.baseUrl + 'admin/announcements', {params});
  }

  getCampgroundSelectOptions(): Observable<Campground[]> {
    const cachedOptions = this.campgroundOptions();

    if (cachedOptions) {
      return of(cachedOptions);
    }

    return this.http.get<Campground[]>(this.baseUrl + 'admin/campgrounds/select-options')
      .pipe(
        tap(options => this.campgroundOptions.set(options))
      );
  }

  clearApiCache() {
    return this.http.delete(this.baseUrl + 'admin/maintenance/clear-cache');
  }
}
