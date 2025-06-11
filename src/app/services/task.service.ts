import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TaskInterface } from '../models/task.interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _storage: Storage | null = null;
  private readonly TASK_KEY = 'tasks';

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    this._storage = await this.storage.create();
  }

  async getTasks(): Promise<TaskInterface[]> {
    const tasks: TaskInterface[] = (await this._storage?.get(this.TASK_KEY)) || [];
    return tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA === dateB) {
        const priorityMap = { high: 0, medium: 1, low: 2 } as const;
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      return dateA - dateB;
    });
  }

  async addTask(task: TaskInterface): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this._storage?.set(this.TASK_KEY, tasks);
  }

  async updateTask(updated: TaskInterface): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === updated.id);
    if (idx > -1) {
      tasks[idx] = updated;
      await this._storage?.set(this.TASK_KEY, tasks);
    }
  }

  async deleteTask(id: number): Promise<void> {
    const tasks = (await this.getTasks()).filter(t => t.id !== id);
    await this._storage?.set(this.TASK_KEY, tasks);
  }

  async searchTasks(query: string): Promise<TaskInterface[]> {
    const tasks = await this.getTasks();
    if (!query) {
      return tasks;
    }
    const lower = query.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      (t.description || '').toLowerCase().includes(lower)
    );
  }

  async filterTasks(status: 'all' | 'completed' | 'pending', tags: string[] = []): Promise<TaskInterface[]> {
    let tasks = await this.getTasks();
    if (status !== 'all') {
      const isCompleted = status === 'completed';
      tasks = tasks.filter(t => t.completed === isCompleted);
    }
    if (tags.length) {
      tasks = tasks.filter(t => tags.every(tag => t.tags.includes(tag)));
    }
    return tasks;
  }
}
