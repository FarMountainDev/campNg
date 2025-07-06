import {signal, inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
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

  getCampgroundAnnouncements(campgroundId: number) {
    return this.http.get<Announcement[]>(`${this.baseUrl}announcements/campgrounds?campgroundIds=${campgroundId}`);
  }

  getAnnouncementClass(announcement: Announcement): string {
    if (announcement.messageType === 1) {
      return 'announcement-info';
    } else if (announcement.messageType === 2) {
      return 'announcement-success';
    } else if (announcement.messageType === 3) {
      return 'announcement-warning';
    } else if (announcement.messageType === 4) {
      return 'announcement-error';
    }

    return 'announcement-default';
  }
}
