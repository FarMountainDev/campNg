export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  isEmailConfirmed: boolean;
  roles: string | string[];
}
