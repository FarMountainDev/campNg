import {Component, inject, OnInit, DestroyRef} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {AnnouncementService} from '../../core/services/announcement.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AnnouncementComponent} from '../../shared/components/announcement/announcement.component';

@Component({
  selector: 'app-home',
  imports: [
    MatButton,
    RouterLink,
    AnnouncementComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected readonly announcementService = inject(AnnouncementService);
  private readonly destroyRef = inject(DestroyRef);
  announcements = this.announcementService.globalAnnouncements;

  ngOnInit() {
    this.announcementService.fetchGlobalAnnouncements()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
