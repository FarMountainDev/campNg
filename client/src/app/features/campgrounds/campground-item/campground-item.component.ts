import {Component, Input} from '@angular/core';
import {Campground} from '../../../shared/models/campground';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-campground-item',
  imports: [
    MatButton,
    MatIcon,
    MatTooltip,
    NgIf
  ],
  templateUrl: './campground-item.component.html',
  styleUrl: './campground-item.component.scss'
})
export class CampgroundItemComponent {
  @Input() campground?: Campground;

  hasCampsiteType(typeId: number): boolean {
    return this.campground?.campsites.some(site => site.campsiteType.id === typeId) || false;
  }
}
