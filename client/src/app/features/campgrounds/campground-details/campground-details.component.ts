import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CampgroundService} from '../../../core/services/campground.service';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {Campground} from '../../../shared/models/campground';
import {catchError, EMPTY, finalize, Subject, takeUntil} from 'rxjs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';
import {AnnouncementService} from '../../../core/services/announcement.service';
import {Announcement} from '../../../shared/models/announcement';
import {AnnouncementsComponent} from '../../../shared/components/announcements/announcements.component';

@Component({
  selector: 'app-campground-details',
  imports: [
    MatProgressSpinnerModule,
    NgIf,
    RouterModule,
    AnnouncementsComponent
  ],
  templateUrl: './campground-details.component.html',
  styleUrl: './campground-details.component.scss'
})
export class CampgroundDetailsComponent implements OnInit, OnDestroy {
  private readonly campgroundsService = inject(CampgroundService);
  private readonly announcementService = inject(AnnouncementService);
  private readonly route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  error = signal<string | null>(null);
  campground = signal<Campground | null>(null);
  announcements = signal<Announcement[]>([]);
  announcementsLoading = signal(false);

  ngOnInit() {
    this.loadCampground();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampground() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.campgroundsService.getCampground(Number(id)).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        const errorMessage = err.status === 404
          ? 'Campground not found'
          : 'Failed to load campground details';
        this.error.set(errorMessage);
        return EMPTY;
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(campground => {
      this.campground.set(campground);
      this.loadCampgroundAnnouncements(campground.id);
    });
  }

  loadCampgroundAnnouncements(campgroundId: number) {
    this.announcementsLoading.set(true);
    this.announcementService.getCampgroundAnnouncements(campgroundId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load announcements', err);
        return EMPTY;
      }),
      finalize(() => this.announcementsLoading.set(false))
    ).subscribe(announcements => {
      this.announcements.set(announcements);
    });
  }
}
