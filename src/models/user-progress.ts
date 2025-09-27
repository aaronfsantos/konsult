export interface Task {
    title: string;
    status: 'done' | 'pending';
}
  
export interface UserProgress {
    uid: string;
    name: string;
    project: string;
    tasks: Task[];
    lastUpdated: Date;
}
  