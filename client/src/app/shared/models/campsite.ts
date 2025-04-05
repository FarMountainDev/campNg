import {Campground} from './campground';
import {CampsiteType} from './campsiteType';
import {Reservation} from './reservation';

export type Campsite = {
  id: number;
  name: string;
  description: string;
  campgroundId: number;
  campground: Campground;
  campsiteTypeId: number;
  campsiteType: CampsiteType;
  reservations: Reservation[];
}
