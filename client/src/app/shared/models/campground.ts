import {Campsite} from './campsite';
import {CampgroundAmenity} from './campgroundAmenity';

export type Campground = {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  amenities: CampgroundAmenity[];
  campsites: Campsite[];
}
