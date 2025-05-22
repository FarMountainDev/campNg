export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  isEmailConfirmed: boolean;
  isLockedOut: boolean;
  roles: string | string[];
}
