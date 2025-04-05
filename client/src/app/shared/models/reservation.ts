import {Campsite} from './campsite';

export type Reservation = {
  id: number;
  startDate: Date;
  endDate: Date;
  campsiteId: number;
  campsite: Campsite;
}
