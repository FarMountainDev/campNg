import {ReservationDto} from './reservationDto';
import {PendingReservationDto} from './pendingReservationDto';

export type CampsiteAvailabilityDto = {
  id: number;
  name: string;
  description: string;
  campgroundId: number;
  campgroundName: string;
  campsiteTypeId: number;
  campsiteTypeName: string;
  weekDayPrice: number;
  weekEndPrice: number;
  reservations: ReservationDto[];
  pendingReservations: PendingReservationDto[];
}
