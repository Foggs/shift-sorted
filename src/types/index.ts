export type UserRole = 'manager' | 'worker';

export interface User {
  id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
}

export interface ProfileMetadata {
  role?: UserRole | null;
  skills?: string[];
  location?: string | null;
}
