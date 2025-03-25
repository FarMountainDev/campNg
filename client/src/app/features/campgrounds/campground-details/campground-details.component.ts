import {Component, inject, OnInit} from '@angular/core';
import {CampgroundService} from '../../../core/services/campground.service';
import {ActivatedRoute} from '@angular/router';
import {Campground} from '../../../shared/models/campground';

@Component({
  selector: 'app-campground-details',
  imports: [],
  templateUrl: './campground-details.component.html',
  styleUrl: './campground-details.component.scss'
})
export class CampgroundDetailsComponent implements OnInit {
  private readonly campgroundsService = inject(CampgroundService);
  private readonly activatedRoute = inject(ActivatedRoute);
  campground?: Campground;

  ngOnInit() {
    this.loadCampground();
  }

  loadCampground() {
    const id = this.activatedRoute.snapshot.params['id'];
    if (!id) return;
    this.campgroundsService.getCampground(+id).subscribe({
      next: campground => this.campground = campground,
      error: error => console.log(error)
    });
  }
}
