export type ReservationDto = {
  id: number;
  email: string;
  startDate: Date;
  endDate: Date;
  campsiteId: number;
  campsiteName: string;
  campgroundName: string;
  orderId: number;
}
