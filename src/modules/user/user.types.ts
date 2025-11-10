export enum UserRole {
  user = 'user',
  admin = 'admin',
}

export type User = {
  id: number;
  fullName: string;
  birthDate: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginEvent = {
  time: string;
  ip: string;
  email: string;
  success: boolean;
  failReason?: string;
};
