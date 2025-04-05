import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CampgroundService} from '../../../core/services/campground.service';
import {ActivatedRoute} from '@angular/router';
import {Campground} from '../../../shared/models/campground';
import {BehaviorSubject, Subject, catchError, EMPTY, finalize, takeUntil} from 'rxjs';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-campground-details',
  imports: [
    MatProgressSpinner,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './campground-details.component.html',
  styleUrl: './campground-details.component.scss'
})
export class CampgroundDetailsComponent implements OnInit, OnDestroy {
  private readonly campgroundsService = inject(CampgroundService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  campground$ = new BehaviorSubject<Campground | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  ngOnInit() {
    this.loadCampground();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampground() {
    const id = this.activatedRoute.snapshot.params['id'];
    if (!id) return;

    this.loading$.next(true);
    this.error$.next(null);

    this.campgroundsService.getCampground(id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.error$.next('Failed to load campground details');
        console.error(err);
        return EMPTY;
      }),
      finalize(() => this.loading$.next(false))
    ).subscribe(campground => {
      this.campground$.next(campground);
    });
  }
}
