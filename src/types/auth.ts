export type Role = 'OWNER' | 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthResponse {
  token: string; // El JWT
  user: User;
}