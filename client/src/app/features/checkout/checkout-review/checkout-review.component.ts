import {Component, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
import {CartService} from '../../../core/services/cart.service';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {ConfirmationToken} from '@stripe/stripe-js';
import {PaymentCardPipe} from '../../../shared/pipes/payment-card.pipe';
import {ReservationService} from '../../../core/services/reservation.service';
import {AnnouncementService} from '../../../core/services/announcement.service';
import {Announcement} from '../../../shared/models/announcement';
import {catchError, EMPTY, finalize} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AnnouncementComponent} from '../../../shared/components/announcement/announcement.component';

@Component({
  selector: 'app-checkout-review',
  imports: [
    CurrencyPipe,
    PaymentCardPipe,
    DatePipe,
    AnnouncementComponent
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss'
})
export class CheckoutReviewComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly reservationService = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly announcementService = inject(AnnouncementService);
  @Input() confirmationToken?: ConfirmationToken;

  announcements = signal<Announcement[]>([]);
  announcementsLoading = signal(false);

  ngOnInit() {
    this.loadCampgroundAnnouncements();
  }

  loadCampgroundAnnouncements() {
    const cart = this.cartService.cart();
    if (!cart || !cart.items.length) return;
    const campgroundIds = Array.from(
      new Set(cart.items.map(item => item.campgroundId))
    );
    if (campgroundIds.length === 0) return;
    this.announcementsLoading.set(true);
    this.announcementService.getCampgroundAnnouncements(campgroundIds).pipe(
      takeUntilDestroyed(this.destroyRef),
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
