export interface EmployeeProgress {
  id: string;
  name: string;
  project: string;
  progress: number; // Percentage
  status: 'On track' | 'At risk';
}
