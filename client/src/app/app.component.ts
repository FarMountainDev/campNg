import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './layout/header/header.component';
import {HttpClient} from '@angular/common/http';
import {Campground} from './shared/models/campground';
import {Pagination} from './shared/models/pagination';
import {CampgroundsComponent} from './features/campgrounds/campgrounds.component';
import {FooterComponent} from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CampgroundsComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  baseUrl = 'https://localhost:5001/api/';
  title = 'CampNg';
  private http = inject(HttpClient);
  campgrounds: Campground[] = [];

  ngOnInit(): void {
    this.http.get<Pagination<Campground>>(this.baseUrl + 'campgrounds').subscribe({
      next: response => this.campgrounds = response.data,
      error: (error: any) => console.error(error),
      complete: () => console.log('complete')
    })
  }
}
