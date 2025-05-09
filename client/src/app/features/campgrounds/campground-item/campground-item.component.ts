import {Component, Input, OnInit} from '@angular/core';
import {Campground} from '../../../shared/models/campground';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-campground-item',
  imports: [
    MatButton,
    MatIcon,
    MatTooltip,
    RouterLink
  ],
  templateUrl: './campground-item.component.html',
  styleUrl: './campground-item.component.scss'
})
export class CampgroundItemComponent implements OnInit {
  @Input() campground?: Campground;
  protected campsiteTypes: string[] = [];

  ngOnInit(): void {
    this.loadCampsiteTypes();
  }

  loadCampsiteTypes() {
    if (!this.campground?.campsites) return;

    // Extract unique campsite types using a Set
    const uniqueTypesSet = new Set(
      this.campground.campsites.map(campsite => campsite.campsiteType)
    );

    // Convert Set back to array
    this.campsiteTypes = Array.from(uniqueTypesSet);
  }
}
