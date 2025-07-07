import {Component, inject, input} from '@angular/core';
import {AnnouncementService} from '../../../../core/services/announcement.service';
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {Announcement} from '../../../models/announcement';
import {Campground} from '../../../models/campground';

@Component({
  selector: 'app-announcement',
  imports: [
    NgClass,
    NgIf,
    DatePipe
  ],
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.scss'
})
export class AnnouncementComponent {
  protected readonly announcementService = inject(AnnouncementService)
  announcement = input<Announcement>();

  getCampgroundNames(campgrounds: Campground[]): string {
    return campgrounds.map(cg => cg.name).join(', ');
  }
}
