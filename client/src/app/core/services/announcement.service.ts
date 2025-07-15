import {signal, inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Announcement} from '../../shared/models/announcement';
import {tap, catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  loading = signal<boolean>(false);
  globalAnnouncements = signal<Announcement[]>([]);

  fetchGlobalAnnouncements() {
    this.loading.set(true);
    return this.http.get<Announcement[]>(`${this.baseUrl}announcements/`).pipe(
      tap(announcements => {
        this.globalAnnouncements.set(announcements);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  getCampgroundAnnouncements(campgroundIds: number[] | number) {
    let params = new HttpParams();
    const campgroundParam = Array.isArray(campgroundIds)
      ? campgroundIds.join(',')
      : campgroundIds.toString();
    params = params.append('campgrounds', campgroundParam);
    return this.http.get<Announcement[]>(`${this.baseUrl}announcements/campground`, {params});
  }

  getAnnouncementClass(announcement: Announcement): string {
    switch (announcement.messageType) {
      case 1:
        return 'announcement-info';
      case 2:
        return 'announcement-success';
      case 3:
        return 'announcement-warning';
      case 4:
        return 'announcement-error';
      default:
        return 'announcement-default';
    }
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
