import {Reservation} from './reservation';

export type Campsite = {
  id: number;
  name: string;
  description: string;
  campground: string;
  campsiteType: string;
  reservations: Reservation[];
}
