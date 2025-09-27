export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: boolean; // true for done, false for pending
}
