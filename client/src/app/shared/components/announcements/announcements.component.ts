import {Component, computed, input} from '@angular/core';
import {Announcement} from '../../models/announcement';
import {AnnouncementComponent} from './announcement/announcement.component';

@Component({
  selector: 'app-announcements',
  imports: [
    AnnouncementComponent
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent {
  announcements = input<Announcement[]>();
  validAnnouncements = computed(() => {
    const allAnnouncements = this.announcements();
    if (!allAnnouncements) return [];
    const currentDate = new Date();
    return allAnnouncements.filter(announcement => {
      return !announcement.expirationDate || new Date(announcement.expirationDate) > currentDate;
    });
  });
}
