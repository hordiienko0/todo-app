export interface TaskInterface {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // store as ISO string for storage simplicity
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  completed: boolean;
}