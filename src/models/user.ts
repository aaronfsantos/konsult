
export type UserRole = 'employee' | 'manager' | 'hr';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  managerUid?: string; // Optional: for employees
}
